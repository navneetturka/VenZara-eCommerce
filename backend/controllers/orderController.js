import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import Razorpay from "razorpay";

// ─── Payment gateway instances ────────────────────────────────────────────────
const currency = "inr";
const deliveryCharge = 10;

// Initialized lazily so .env is guaranteed to be loaded first
const getStripe = () => new Stripe(process.env.STRIPE_SECRET_KEY);

const getRazorpay = () =>
  new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

const normalizeOrderItems = (items = []) =>
  items.map((item) => ({
    productId: String(item._id || item.productId || ""),
    name: item.name,
    image: Array.isArray(item.image) ? item.image : item.image ? [item.image] : [],
    price: Number(item.price) || 0,
    quantity: Number(item.quantity) || 1,
    size: item.size || "",
  }));

// ─── Cash on Delivery ─────────────────────────────────────────────────────────
const placeOrder = async (req, res) => {
  try {
    const { items, amount, address } = req.body;
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }

    const orderData = {
      userId: String(userId),
      items: normalizeOrderItems(items),
      address,
      amount,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
      status: "Order Placed",
    };

    const newOrder = new orderModel(orderData);
await newOrder.save();

// Clear cart
await userModel.findByIdAndUpdate(userId, { cartData: {} });

res.json({
  success: true,
  message: "Order Placed",
  orderId: newOrder._id   // ⭐ ADD THIS
});
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ─── Stripe ───────────────────────────────────────────────────────────────────
const placeOrderStripe = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, amount, address } = req.body;
    const { origin } = req.headers;

    const orderData = {
      userId: String(userId),
      items: normalizeOrderItems(items),
      address,
      amount,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
      status: "Order Placed",
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // Build line items for Stripe Checkout
    const line_items = items.map((item) => ({
      price_data: {
        currency,
        product_data: { name: item.name },
        unit_amount: item.price * 100, // Stripe uses smallest currency unit
      },
      quantity: item.quantity,
    }));

    // Add delivery charge line item
    line_items.push({
      price_data: {
        currency,
        product_data: { name: "Delivery Charges" },
        unit_amount: deliveryCharge * 100,
      },
      quantity: 1,
    });

    const session = await getStripe().checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: "payment",
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ─── Verify Stripe Payment ────────────────────────────────────────────────────
const verifyStripe = async (req, res) => {
  const { orderId, success, userId } = req.body;

  try {
    if (success === "true") {
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      res.json({ success: true });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ─── Razorpay ─────────────────────────────────────────────────────────────────
const placeOrderRazorpay = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, amount, address } = req.body;

    const orderData = {
      userId: String(userId),
      items: normalizeOrderItems(items),
      address,
      amount,
      paymentMethod: "Razorpay",
      payment: false,
      date: Date.now(),
      status: "Order Placed",
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const options = {
      amount: amount * 100,
      currency: currency.toUpperCase(),
      receipt: newOrder._id.toString(),
    };

    await getRazorpay().orders.create(options, (error, order) => {
      if (error) {
        console.error(error);
        return res.json({ success: false, message: error });
      }
      res.json({ success: true, order });
    });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ─── Verify Razorpay Payment ──────────────────────────────────────────────────
const verifyRazorpay = async (req, res) => {
  try {
    const { userId, razorpay_order_id } = req.body;

    const orderInfo = await getRazorpay().orders.fetch(razorpay_order_id);

    if (orderInfo.status === "paid") {
      await orderModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      res.json({ success: true, message: "Payment Successful" });
    } else {
      res.json({ success: false, message: "Payment Failed" });
    }
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ─── All Orders (Admin) ───────────────────────────────────────────────────────
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ─── User Orders ──────────────────────────────────────────────────────────────
const userOrders = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }
    const orders = await orderModel
      .find({ userId: String(userId) })
      .sort({ date: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ─── Update Order Status (Admin) ──────────────────────────────────────────────
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, message: "Status Updated" });
  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const order = await orderModel.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (userId && String(order.userId) !== String(userId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order",
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ─── User: cancel order ───────────────────────────────────────────────────────
const cancelOrderByUser = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    const order = await orderModel.findById(id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    if (String(order.userId) !== String(userId)) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }
    if (order.status === "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Delivered orders cannot be cancelled",
      });
    }
    if (order.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Order is already cancelled",
      });
    }

    await orderModel.findByIdAndUpdate(id, { status: "Cancelled" });
    res.json({ success: true, message: "Order cancelled" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── User: patch status (cancel only from client) ─────────────────────────────
const patchOrderByUser = async (req, res) => {
  try {
    const { status } = req.body;
    if (status === "Cancelled") {
      return cancelOrderByUser(req, res);
    }
    return res.status(400).json({
      success: false,
      message: "Only cancellation is allowed",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export {
  placeOrder,
  placeOrderStripe,
  placeOrderRazorpay,
  verifyStripe,
  verifyRazorpay,
  allOrders,
  userOrders,
  updateStatus,
  getOrderById,
  cancelOrderByUser,
  patchOrderByUser,
};