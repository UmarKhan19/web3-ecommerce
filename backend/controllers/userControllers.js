const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const sendEmail = require("../utils/sendMail");

// //////////////////////////////////////////////////////////////////
// Validate Fields
// //////////////////////////////////////////////////////////////////

const validateFields = (fields) => {
  const requiredFields = ["email", "password", "profile"];
  for (const field of requiredFields) {
    if (!fields[field]) {
      return field;
    }
  }
  return null;
};

// //////////////////////////////////////////////////////////////////
// Register User
// //////////////////////////////////////////////////////////////////

const registerUser = async (req, res) => {
  try {
    // Extract user registration data from the request body
    const { email, password, role, firstName, lastName, address, phoneNumber } =
      req.body;

    if (!email || !password || !phoneNumber || !firstName || !lastName) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Please provide all the required information",
        });
    }

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user instance
    const newUser = new User({
      email,
      password: hashedPassword,
      role,
      firstName,
      lastName,
      address,
      phoneNumber,
    });

    // Save the user to the database
    await newUser.save();

    const token = jwt.sign(
      { userId: newUser._id, role: newUser.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d", // Token expiration time (adjust as needed)
      }
    );
    // Return a success message
    res
      .status(201)
      .header("Authorization", `Bearer ${token}`)
      .json({
        success: true,
        message: "User registered successfully",
        token: `Bearer ${token}`,
      });
  } catch (error) {
    console.error("Error during user registration:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// //////////////////////////////////////////////////////////////////
// Login User
// //////////////////////////////////////////////////////////////////

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Compare the provided password with the hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate and send JWT token upon successful login
    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d", // Token expiration time (adjust as needed)
      }
    );

    res
      .status(200)
      .header("Authorization", `Bearer ${token}`)
      .json({
        success: true,
        message: "Login successfull",
        token: `Bearer ${token}`,
      });
  } catch (error) {
    res.status(500).json({ error: "An error occurred while logging in" });
  }
};

// //////////////////////////////////////////////////////////////////
// Get User Profile
// //////////////////////////////////////////////////////////////////

const getProfile = async (req, res) => {
  try {
    // Use req.user to get the authenticated user's ID from the middleware
    const userId = req.user.id;

    // Fetch user profile from the database using the userId
    const userProfile = await User.findById(userId);

    if (!userProfile) {
      return res.status(404).json({ error: "User profile not found" });
    }

    res.status(200).json(userProfile);
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while fetching user profile" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});

    if (users.length === 0) {
      return res.status(404).json({ success: true, message: "No users found" });
    }

    res.status(201).json({ success: true, totalUsers: users.length, users });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.log(error);
    }
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const searchUser = async (req, res) => {
  try {
    const query = req.query.q; // Get the search query from the query parameter

    const users = await User.find({
      $or: [
        { email: { $regex: query, $options: "i" } }, // Search by product name (case-insensitive)
        { firstName: { $regex: query, $options: "i" } }, // Search by product description (case-insensitive)
        { lastName: { $regex: query, $options: "i" } }, // Search by product description (case-insensitive)
      ],
    });

    if (users.length === 0) {
      return res
        .status(404)
        .json({ message: "No users found matching the search query" });
    }

    res.status(200).json({ totalUsers: users.length, users });
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
};

// //////////////////////////////////////////////////////////////////
// Update User Profile
// //////////////////////////////////////////////////////////////////

const updateUser = async (req, res) => {
  try {
    const { firstName, lastName, address, phoneNumber } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
    }

    //   Update the user profile
    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.address = address || user.address;
    user.phoneNumber = phoneNumber || user.phoneNumber;

    //   save the updated user profile
    await user.save();

    res.status(200).json({ success: true, message: "User Profile Updated" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

// //////////////////////////////////////////////////////////////////
// Update User Password
// //////////////////////////////////////////////////////////////////

const changeUserPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id; // Extracted from authentication middleware

    if (!currentPassword || !newPassword) {
      return res.status(403).json({
        success: false,
        message: "Please provide the required information",
      });
    }

    // Find the user by ID
    const user = await User.findById(userId).select("+password");

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Compare current password with hashed password
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash and update the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;

    // Save the updated user with new password
    await user.save();

    res.status(200).json({ success: true, message: "Password Changed" });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "An error occurred while updating the password",
    });
  }
};

// //////////////////////////////////////////////////////////////////
// Delete User Account
// //////////////////////////////////////////////////////////////////

const deleteUserAccount = async (req, res) => {
  try {
    const userId = req.user.id; // Extracted from authentication middleware

    // Delete the user by ID
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "User account deleted successfully" });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "An error occurred while deleting the account",
    });
  }
};

// //////////////////////////////////////////////////////////////////
// Forgot Password
// //////////////////////////////////////////////////////////////////

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Generate a password reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // Token valid for 1 hour

    // Save the user with the reset token and expiration
    await user.save();

    // Send a password reset email with the token
    const resetLink = `http://${process.env.FRONTEND_URI}/reset-password/${resetToken}`;
    const emailSubject = "Password Reset Request";
    const emailText = `You have requested a password reset. Click the following link to reset your password: ${resetLink}`;

    await sendEmail(email, emailSubject, emailText);

    res
      .status(200)
      .json({ success: true, message: "Password reset email sent" });
  } catch (error) {
    res.status(500).json({
      error: `An error occurred while processing the request ${error}`,
    });
  }
};

// //////////////////////////////////////////////////////////////////
// Reset User Password
// //////////////////////////////////////////////////////////////////

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      res.status(401).json({
        success: false,
        message: "Please provide the required information",
      });
    }

    // Find the user by the reset token and ensure it's not expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password and reset token fields
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Save the updated user
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while processing the request" });
  }
};

module.exports = {
  registerUser,
  getProfile,
  loginUser,
  updateUser,
  changeUserPassword,
  deleteUserAccount,
  forgotPassword,
  resetPassword,
  getAllUsers,
  searchUser,
};
