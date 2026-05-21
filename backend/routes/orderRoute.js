import express from "express";
import {
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
} from "../controllers/orderController.js";
import adminAuth from "../middleware/adminAuth.js";
import userAuth from "../middleware/userAuth.js";

const orderRouter = express.Router();

// ─── User: list & single (GET) ────────────────────────────────────────────────
orderRouter.get("/", userAuth, userOrders);
orderRouter.post("/userorders", userAuth, userOrders);

orderRouter.get("/:id", userAuth, getOrderById);
orderRouter.patch("/:id", userAuth, patchOrderByUser);
orderRouter.post("/:id/cancel", userAuth, cancelOrderByUser);

// ─── Admin ────────────────────────────────────────────────────────────────────
orderRouter.post("/list", adminAuth, allOrders);
orderRouter.post("/status", adminAuth, updateStatus);

// ─── Checkout ─────────────────────────────────────────────────────────────────
orderRouter.post("/place", userAuth, placeOrder);
orderRouter.post("/stripe", userAuth, placeOrderStripe);
orderRouter.post("/razorpay", userAuth, placeOrderRazorpay);

// ─── Verify payments ──────────────────────────────────────────────────────────
orderRouter.post("/verifyStripe", userAuth, verifyStripe);
orderRouter.post("/verifyRazorpay", userAuth, verifyRazorpay);

export default orderRouter;
