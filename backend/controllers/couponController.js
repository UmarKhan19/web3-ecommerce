const Coupon = require("../models/couponModel");
const Category = require("../models/categoryModel");

const addCoupon = async (req, res) => {
  try {
    const {
      code,
      description,
      discountPercentage,
      usageLimit,
      expirationDate,
      minimumPurchaseAmount,
      applicableCategories,
      isOneTimeUse,
    } = req.body;

    // Check if the coupon code is unique
    const existingCoupon = await Coupon.exists({ code });

    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: "Coupon code already exists",
      });
    }

    // Create a new coupon
    const newCoupon = new Coupon({
      code,
      description,
      discountPercentage,
      usageLimit,
      expirationDate,
      minimumPurchaseAmount,
      isOneTimeUse,
    });
    if (applicableCategories && applicableCategories?.length !== 0) {
      // Validate applicable categories
      const validApplicableCategories = await validateCategories(
        applicableCategories
      );
      newCoupon.applicableCategories = validApplicableCategories;
    }
    // Save the coupon
    await newCoupon.save();

    res.status(201).json({
      success: true,
      message: "Coupon added successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const { couponId } = req.params;

    // Delete the coupon
    const deletedCoupon = await Coupon.findByIdAndDelete(couponId);

    if (!deletedCoupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }

    res.status(200).json({
      success: true,
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().populate("applicableCategories");

    res.status(200).json({
      success: true,
      totalCoupons: coupons.length,
      coupons,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const searchCoupon = async (req, res) => {
  try {
    const query = req.query.q; // Get the search query from the query parameter

    const coupons = await Coupon.find({
      $or: [
        {
          code: { $regex: query, $options: "i" },
        },
        { description: { $regex: query, $options: "i" } },
      ],
    });

    if (coupons.length === 0) {
      return res
        .status(404)
        .json({ message: "No coupons found matching the search query" });
    }

    res.status(200).json({ totalCoupons: coupons.length, coupons });
  } catch (error) {
    next(error); // Pass the error to the error handler middleware
  }
};

// Helper function to validate applicable categories
async function validateCategories(categoryIds) {
  try {
    const validCategories = await Category.find({ _id: { $in: categoryIds } });

    return validCategories.map((category) => category._id);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

module.exports = { addCoupon, deleteCoupon, getAllCoupons, searchCoupon };
