const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const OrderItem = require("../models/orderItemModel");
const Coupon = require("../models/couponModel");
const productVariant = require("../models/productVariantModel");
const sendEmail = require("../utils/sendMail");

const createOrder = async (req, res) => {
  try {
    const { orderItems, address, phoneNumber, couponId } = req.body;
    const userId = req.user.id;

    // Validate input data
    if (
      !orderItems ||
      !Array.isArray(orderItems) ||
      orderItems.length === 0 ||
      !address ||
      !phoneNumber
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide valid order items, address, and phone number",
      });
    }

    if (
      !address.streetAddress ||
      !address.city ||
      !address.state ||
      !address.country ||
      !address.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Please provide all the information in address",
      });
    }

    // Fetch product details for all order items in parallel
    const productVariantIds = orderItems.map((item) => item.variant);
    const productVariants = await productVariant.find({
      _id: { $in: productVariantIds },
    });
    // Calculate totalAmount and build orderItems array
    let totalAmount = 0;
    const orderItemsArray = [];

    for (const item of orderItems) {
      const product = productVariants.find(
        (p) => p._id.toString() === item.variant
      );
      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Variant with ID ${item.variant} not found`,
        });
      }

      const itemTotalPrice = product.totalPrice * item.quantity;
      totalAmount += itemTotalPrice;

      const orderItem = new OrderItem({
        variant: item.variant,
        quantity: item.quantity,
        unitPrice: product.totalPrice,
      });

      // Save the orderItem to the database
      await orderItem.save();

      orderItemsArray.push(orderItem);
    }

    // Create the order
    const order = new Order({
      user: userId,
      totalAmount,
      orderItems: orderItemsArray,
      address,
      phoneNumber,
      // Add other order properties here
    });

    let discountAmount = 0; // Initialize discountAmount

    // Check if a valid coupon ID is provided
    if (couponId !== "" && couponId !== undefined) {
      const coupon = await Coupon.findById(couponId);
      if (coupon) {
        // Check if it clears the minimum amount requirement
        if (coupon.minimumPurchaseAmount > totalAmount) {
          return res.status(400).json({
            success: false,
            message: "Minimum Purchase Amount criteria did not meet",
          });
        }
        // Check if the order contains products that the coupon is not applicable for
        if (
          coupon.applicableCategories.length > 0 &&
          productVariants.some(async (item) => {
            const product = await Product.findById(item.product);
            return !product.category.some((c) =>
              coupon.applicableCategories.includes(c)
            );
          })
        ) {
          return res.status(400).json({
            success: false,
            message:
              "This coupon is not applicable on one or more products in the order",
          });
        }

        // Check if the coupon is one-time use and the user has already used it
        if (coupon.isOneTimeUse && coupon.usedByUsers.includes(userId)) {
          return res.status(400).json({
            success: false,
            message: "You have already used this one-time use coupon",
          });
        }

        // Check if the coupon has a usage limit
        if (coupon.usageLimit !== undefined && coupon.usageLimit !== null) {
          // Check if the coupon has reached its usage limit
          if (coupon.usageCount >= coupon.usageLimit) {
            return res.status(400).json({
              success: false,
              message: "This coupon has reached its usage limit",
            });
          }
        }

        // Calculate the discount amount
        discountAmount = (coupon.discountPercentage / 100) * totalAmount;

        // Apply the coupon to the order
        order.coupon = coupon._id;
        order.discountAmount = discountAmount;
        coupon.usageCount += 1;
        coupon.usedByUsers.push(userId);

        // Save the updated coupon
        await coupon.save();
      } else {
        return res.status(400).json({
          success: false,
          message: "Coupon not found",
        });
      }
    }

    // Reduce the totalAmount by the discountAmount
    order.totalAmount -= discountAmount;

    // Save the order to the database
    await order.save();

    const populatedOrder = await Order.findById(order._id)
      .populate("user", "firstName lastName email")
      .populate({
        path: "orderItems",
        populate: {
          path: "variant",
        },
      })
      .populate("coupon", "code");

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("user", "firstName lastName email")
      .populate("coupon", "code description discountPercentage")
      .populate({
        path: "orderItems",
        select: "-createdAt -updatedAt -__v",
        populate: {
          path: "variant",
          select: "-createdAt -updatedAt -__v",
          populate: {
            path: "product",
            select: "_id name description rating category",
            populate: { path: "category", select: "name description" },
          },
        },
      })
      .select("-createdAt -updatedAt -__v");

    if (orders.length === 0)
      return res
        .status(201)
        .json({ success: true, message: "No orders found" });

    res.status(200).json({ success: true, totalOrders: orders.length, orders });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.log(error);
    }
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getSingleOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate("user", "firstName lastName email")
      .populate("coupon", "code description discountPercentage")
      .populate({
        path: "orderItems",
        select: "-createdAt -updatedAt -__v",
        populate: {
          path: "variant",
          select: "-createdAt -updatedAt -__v",
          populate: {
            path: "product",
            select: "_id name description rating category",
            populate: { path: "category", select: "name description" },
          },
        },
      })
      .select("-createdAt -updatedAt -__v");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const { id } = req.user;

    const order = await Order.find({ user: id })
      .populate("user", "firstName lastName email")
      .populate("coupon", "code description discountPercentage")
      .populate({
        path: "orderItems",
        select: "-createdAt -updatedAt -__v",
        populate: {
          path: "variant",
          select: "-createdAt -updatedAt -__v",
          populate: {
            path: "product",
            select: "_id name description rating category",
            populate: { path: "category", select: "name description" },
          },
        },
      })
      .select("-createdAt -updatedAt -__v");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.find({ user: id })
      .populate("user", "firstName lastName email")
      .populate("coupon", "code description discountPercentage")
      .populate({
        path: "orderItems",
        select: "-createdAt -updatedAt -__v",
        populate: {
          path: "variant",
          select: "-createdAt -updatedAt -__v",
          populate: {
            path: "product",
            select: "_id name description rating category",
            populate: { path: "category", select: "name description" },
          },
        },
      })
      .select("-createdAt -updatedAt -__v");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const orderStatusChange = async (req, res) => {
  try {
    const { orderId } = req.params;

    const { status } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    try {
      order.orderStatus = status;

      await order.save();
    } catch (error) {
      const sts = error.errors.orderStatus.properties.enumValues;

      return res.status(500).json({
        success: false,
        message: `${status} is not a valid status. Please provide a valid status from: ${sts}`,
      });
    }

    res
      .status(200)
      .json({ success: true, message: "Status updated Successfully" });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const { id } = req.user;
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate({
      path: "user",
      select: "email",
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.user._id.toString() !== id) {
      return res
        .status(400)
        .json({ success: false, message: "Order is not by this user" });
    }

    try {
      order.orderStatus = "cancelled";
      await order.save();
    } catch (error) {
      return res.status(500).json({ success: false, message: "fuck" });
    }
    sendEmail(
      order.user.email,
      "Order Cancellation",
      "Your order has been cancelled"
    );
    res
      .status(200)
      .json({ success: true, message: "Order cancelled successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal Server Error" });
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getSingleOrder,
  getMyOrders,
  getUserOrders,
  orderStatusChange,
  cancelOrder,
};
