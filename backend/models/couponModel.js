const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true, unique: true },
    description: { type: String, trim: true },
    discountPercentage: { type: Number, min: 0, max: 100, required: true },
    usageLimit: { type: Number, min: 0, default: null },
    usageCount: { type: Number, min: 0, default: 0 },
    expirationDate: Date,
    minimumPurchaseAmount: { type: Number, min: 0, default: 0 },
    applicableCategories: [
      {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "Category",
      },
    ],
    usedByUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isOneTimeUse: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coupon", couponSchema);
