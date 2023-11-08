const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    description: { type: String, required: true },
    variants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "ProductVariant", // Reference to the ProductVariant model
      },
    ],
    category: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],
    rating: { type: Number, required: true, min: 0, max: 5, default: 0 },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    viewCount: { type: Number, required: true, min: 0, default: 0 },
    salesCount: { type: Number, required: true, min: 0, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
