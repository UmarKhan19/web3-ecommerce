const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
    totalAmount: { type: Number, required: true, min: 0 },
    orderItems: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "OrderItem",
        required: true,
      },
    ],
    address: {
      streetAddress: { type: String, required: true, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      country: { type: String, required: true, trim: true },
      pincode: { type: String, required: true, trim: true },
    },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      lowercase: true,
    },
    phoneNumber: { type: Number, required: true },
    discountAmount: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, required: true, default: 0, min: 0 },
    shippingCost: { type: Number, required: true, default: 0, min: 0 },
    refundAmount: { type: Number, min: 0 },
    returnRequested: Boolean,
    returnReason: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
