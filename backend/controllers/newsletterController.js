import userModel from "../models/userModel.js";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
const verifyCoupon = async (req, res) => {

  try {

    const { couponCode } = req.body;

    const user = await userModel.findOne({
      couponCode,
    });

    if (!user) {

      return res.json({
        success: false,
        message: "Invalid Coupon",
      });

    }

    res.json({
      success: true,
      discountPercent: 20,
    });

  } catch (error) {

    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });

  }
};
const subscribeNewsletter = async (req, res) => {
  try {

    const userId = req.userId;

    const user = await userModel.findById(userId);

    if (!user) {
      return res.json({
        success: false,
        message: "User not found",
      });
    }

    // Already subscribed
    if (user.isSubscribed) {
      return res.json({
        success: false,
        message: "Already subscribed",
      });
    }

    // Generate coupon
    const couponCode =
      "VENZARA20-" +
      Math.floor(1000 + Math.random() * 9000);

    // Save in DB
    user.isSubscribed = true;
    user.couponCode = couponCode;

    await user.save();

    // Send Email
    await transporter.sendMail({
      from: `"VenZara 🛒" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Your 20% OFF Coupon 🎉",

      html: `
        <div style="font-family:Arial;padding:20px;">
          <h2>Hello ${user.name} 👋</h2>

          <p>Thanks for subscribing to VenZara Newsletter 🎉</p>

          <h1 style="
            background:black;
            color:white;
            display:inline-block;
            padding:12px 25px;
            border-radius:8px;
          ">
            ${couponCode}
          </h1>

          <p style="margin-top:20px;">
            Apply this coupon during checkout and get
            <b>20% OFF</b>.
          </p>
        </div>
      `,
    });

    res.json({
      success: true,
      message: "Coupon sent to your email",
    });

  } catch (error) {

    console.log(error);

    res.json({
      success: false,
      message: error.message,
    });
  }
};

export {
  subscribeNewsletter,
  verifyCoupon,
};