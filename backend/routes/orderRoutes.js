const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const checkAdmin = require("../middleware/isAdmin");
const {
  createOrder,
  getAllOrders,
  getSingleOrder,
  getMyOrders,
  orderStatusChange,
  cancelOrder,
  getUserOrders,
} = require("../controllers/orderController");

const router = express.Router();

router.post("/create", authMiddleware, createOrder);
router.get("/", authMiddleware, checkAdmin, getAllOrders);
router.get("/my", authMiddleware, getMyOrders);
router.get("/user/:id", authMiddleware, checkAdmin, getUserOrders);
router.get("/:orderId", authMiddleware, getSingleOrder);
router.put("/:orderId", authMiddleware, checkAdmin, orderStatusChange);
router.put("/cancel/:orderId", authMiddleware, cancelOrder);

module.exports = router;
