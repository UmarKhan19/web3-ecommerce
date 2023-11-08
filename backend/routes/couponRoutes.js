const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const checkAdmin = require("../middleware/isAdmin");
const {
  addCoupon,
  deleteCoupon,
  getAllCoupons,
  searchCoupon,
} = require("../controllers/couponController");

const router = express.Router();

router.post("/add", authMiddleware, checkAdmin, addCoupon);
router.get("/", getAllCoupons);
router.get("/search", searchCoupon);
router.delete("/:couponId", authMiddleware, checkAdmin, deleteCoupon);

module.exports = router;
