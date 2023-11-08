const mongoose = require("mongoose");

const productVariantSchema = new mongoose.Schema(
  {
    color: String,
    size: String,
    images: [{ type: String, required: true }],
    stock: { type: Number, required: true, default: 1, min: 0 },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, min: 0, max: 100, default: 0 },
    totalPrice: { type: Number, required: true, min: 0 }, // Reference to the parent product
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // Reference to the Product model
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ProductVariant", productVariantSchema);
