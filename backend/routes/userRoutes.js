const express = require("express");
const {
  getProfile,
  registerUser,
  loginUser,
  updateUser,
  changeUserPassword,
  deleteUserAccount,
  forgotPassword,
  resetPassword,
  getAllUsers,
  searchUser,
} = require("../controllers/userControllers");
const authMiddleware = require("../middleware/authMiddleware");
const checkAdmin = require("../middleware/isAdmin");
const router = express.Router();

// Create a new user
router.post("/register", registerUser);
router.get("/me", authMiddleware, getProfile);
router.get("/all", getAllUsers);
router.get("/search", searchUser);
router.post("/login", loginUser);
router.put("/update", authMiddleware, updateUser);
router.put("/change-password", authMiddleware, changeUserPassword);
router.delete("/delete-account", authMiddleware, deleteUserAccount);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
