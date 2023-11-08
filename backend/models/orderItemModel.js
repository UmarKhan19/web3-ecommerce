const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    variant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProductVariant", // Reference to the ProductVariant model
      required: true,
    },
    quantity: { type: Number, required: true, default: 1, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 }, // Price for this variant
  },
  { timestamps: true }
);

module.exports = mongoose.model("OrderItem", orderItemSchema);
