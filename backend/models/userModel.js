const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, trim: true, unique: true },
    password: { required: true, type: String, select: false },
    role: {
      type: String,
      default: "user",
      enum: ["admin", "user"],
      required: true,
    },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, trim: true },
    address: {
      streetAddress: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true },
      pincode: { type: String, trim: true },
    },
    phoneNumber: { type: String, required: true, trim: true },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
