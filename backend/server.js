import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/mongodb.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import orderRouter from "./routes/orderRoute.js";
import reviewRouter from "./routes/reviewRoute.js";
import newsletterRouter from "./routes/newsletterRoute.js";

// ─── App Setup ────────────────────────────────────────────────────────────────
const app = express();
const port = process.env.PORT || 4000;

// ─── Connect Services ─────────────────────────────────────────────────────────
connectDB();
connectCloudinary();

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cors());

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/order", orderRouter);
app.use("/api/orders", orderRouter);
app.use("/api/review", reviewRouter);
app.use("/api/newsletter", newsletterRouter);
// ─── Health Check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("🚀 Forever E-Commerce API is running");
});

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
