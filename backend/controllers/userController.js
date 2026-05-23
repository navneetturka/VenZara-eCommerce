import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import nodemailer from "nodemailer";
import crypto from "crypto";

// 📩 Nodemailer Setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Helper: create JWT token for user
const createToken = (id) => {
  return jwt.sign({ id: String(id) }, process.env.JWT_SECRET);
};

// ─── Register ─────────────────────────────────────────────────────────────────
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // Validate email and password
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" });
    }

    if (password.length < 8) {
      return res.json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });

    const user = await newUser.save();
// 📩 Send Welcome Email
try {
  await transporter.sendMail({
    from: `"VenZara Store 🛒" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Welcome to VenZara Store 🎉",

    html: `
      <div style="
        margin:0;
        padding:0;
        background-color:#f4f4f4;
        font-family:Arial, sans-serif;
      ">

        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding:40px 0;">

              <table width="600" cellpadding="0" cellspacing="0"
                style="
                  background:#ffffff;
                  border-radius:12px;
                  overflow:hidden;
                  box-shadow:0 4px 10px rgba(0,0,0,0.1);
                ">

                <!-- Header -->
                <tr>
                  <td align="center"
                    style="
                      background:#111827;
                      padding:30px;
                    ">

                    <h1 style="
                      color:#ffffff;
                      margin:0;
                      font-size:34px;
                    ">
                      🛒 VenZara
                    </h1>

                    <p style="
                      color:#d1d5db;
                      margin-top:8px;
                      font-size:14px;
                    ">
                      Smart Shopping Starts Here
                    </p>

                  </td>
                </tr>

                <!-- Body -->
                <tr>
                  <td style="padding:40px; color:#374151;">

                    <h2 style="
                      margin-top:0;
                      color:#111827;
                    ">
                      Hello, ${name} 👋
                    </h2>

                    <p style="
                      font-size:16px;
                      line-height:1.7;
                    ">
                      Welcome to 
                      <strong>VenZara Store</strong> 🎉
                    </p>

                    <p style="
                      font-size:16px;
                      line-height:1.7;
                    ">
                      Your account has been created successfully.
                    </p>

                    <ul style="
                      font-size:16px;
                      line-height:2;
                      padding-left:20px;
                    ">
                      <li>🛍️ Explore amazing products</li>
                      <li>🛒 Add items to your cart</li>
                      <li>💳 Secure checkout</li>
                      <li>🚚 Easy order tracking</li>
                    </ul>

                    <div style="text-align:center; margin:35px 0;">
                      <a href="http://localhost:5173"
                        style="
                          background:#2563eb;
                          color:#ffffff;
                          text-decoration:none;
                          padding:14px 28px;
                          border-radius:8px;
                          font-size:16px;
                          font-weight:bold;
                          display:inline-block;
                        ">
                        Start Shopping
                      </a>
                    </div>

                    <p style="
                      font-size:15px;
                      color:#6b7280;
                    ">
                      Thank you for choosing VenZara ❤️
                    </p>

                    <p style="
                      font-size:15px;
                      color:#6b7280;
                    ">
                      — Team VenZara
                    </p>

                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td align="center"
                    style="
                      background:#f3f4f6;
                      padding:20px;
                      font-size:13px;
                      color:#6b7280;
                    ">

                    © 2026 VenZara Store <br/>
                    All Rights Reserved

                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>

      </div>
    `,
  });

  console.log("✅ Welcome email sent");

} catch (err) {
  console.log("❌ Email not sent:", err.message);
}



    // Create token
    const token = createToken(user._id);

    res.json({ success: true, token });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (isMatch) {
      const token = createToken(user._id);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    // 🔑 token generate
    const resetToken = crypto.randomBytes(32).toString("hex");

    // expiry (10 min)
    user.resetToken = resetToken;
    user.resetTokenExpire = Date.now() + 10 * 60 * 1000;

    await user.save();

    // 📩 Email bhejo
    const resetLink = `http://localhost:5173/reset-password/${resetToken}`;

    await transporter.sendMail({
      from: `"VenZara 🛒" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Reset Your Password 🔐",
      html: `
        <h2>Forgot your password? 😄</h2>
        <p>Click below to reset:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 10 minutes.</p>
      `,
    });

    res.json({ success: true, message: "Reset link sent to email" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await userModel.findOne({
      resetToken: token,
      resetTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.json({ success: false, message: "Token expired or invalid" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    user.resetToken = undefined;
    user.resetTokenExpire = undefined;

    await user.save();

    res.json({ success: true, message: "Password reset successful" });

  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ─── Admin Login ──────────────────────────────────────────────────────────────
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      res.json({ success: true, token });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ─── Get Cart ─────────────────────────────────────────────────────────────────
const getUserCart = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login again.",
      });
    }

    const userData = await userModel.findById(userId);

if (!userData) {
  return res.json({
    success: false,
    message: "User not found"
  });
}

const cartData = userData.cartData;

    res.json({ success: true, cartData });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ─── Add To Cart ──────────────────────────────────────────────────────────────
const addToCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId, size } = req.body;

    const userData = await userModel.findById(userId);

if (!userData) {
  return res.json({
    success: false,
    message: "User not found"
  });
}

let cartData = userData.cartData || {};

    if (cartData[itemId]) {
      if (cartData[itemId][size]) {
        cartData[itemId][size] += 1;
      } else {
        cartData[itemId][size] = 1;
      }
    } else {
      cartData[itemId] = {};
      cartData[itemId][size] = 1;
    }

    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({ success: true, message: "Added To Cart" });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};

// ─── Update Cart ──────────────────────────────────────────────────────────────
const updateCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId, size, quantity } = req.body;

    const userData = await userModel.findById(userId);

if (!userData) {
  return res.json({
    success: false,
    message: "User not found"
  });
}

let cartData = userData.cartData || {};

    cartData[itemId][size] = quantity;

    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({ success: true, message: "Cart Updated" });

  } catch (error) {
    console.error(error);
    res.json({ success: false, message: error.message });
  }
};


// ─── Google Login/Register ─────────────────────
const googleLogin = async (req, res) => {
  try {

    const { name, email } = req.body;

    let user = await userModel.findOne({ email });

    // If user doesn't exist → create account
    if (!user) {

      console.log("NEW GOOGLE USER CREATED");

      user = new userModel({
        name,
        email,
        password: "google-auth-user",
      });

      await user.save();

      console.log("SENDING GOOGLE WELCOME MAIL");

      try {
      await transporter.sendMail({
        from: `"VenZara Store 🛒" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: "Welcome to VenZara 🎉",

       html: `
  <div style="
    margin:0;
    padding:0;
    background-color:#f4f4f4;
    font-family:Arial, sans-serif;
  ">

    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" style="padding:40px 0;">

          <table width="600" cellpadding="0" cellspacing="0"
            style="
              background:#ffffff;
              border-radius:12px;
              overflow:hidden;
              box-shadow:0 4px 10px rgba(0,0,0,0.1);
            ">

            <!-- Header -->
            <tr>
              <td align="center"
                style="
                  background:#111827;
                  padding:30px;
                ">

                <h1 style="
                  color:#ffffff;
                  margin:0;
                  font-size:34px;
                ">
                  🛒 VenZara
                </h1>

                <p style="
                  color:#d1d5db;
                  margin-top:8px;
                  font-size:14px;
                ">
                  Smart Shopping Starts Here
                </p>

              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:40px; color:#374151;">

                <h2 style="
                  margin-top:0;
                  color:#111827;
                ">
                  Hello, ${name} 👋
                </h2>

                <p style="
                  font-size:16px;
                  line-height:1.7;
                ">
                  Welcome to 
                  <strong>VenZara Store</strong> 🎉
                </p>

                <p style="
                  font-size:16px;
                  line-height:1.7;
                ">
                  Your account has been created successfully using Google Sign In.
                </p>

                <ul style="
                  font-size:16px;
                  line-height:2;
                  padding-left:20px;
                ">
                  <li>🛍️ Explore amazing products</li>
                  <li>🛒 Add items to your cart</li>
                  <li>💳 Secure checkout</li>
                  <li>🚚 Easy order tracking</li>
                </ul>

                <div style="text-align:center; margin:35px 0;">
                  <a href="http://localhost:3000"
                    style="
                      background:#2563eb;
                      color:#ffffff;
                      text-decoration:none;
                      padding:14px 28px;
                      border-radius:8px;
                      font-size:16px;
                      font-weight:bold;
                      display:inline-block;
                    ">
                    Start Shopping
                  </a>
                </div>

                <p style="
                  font-size:15px;
                  color:#6b7280;
                ">
                  Thank you for choosing VenZara ❤️
                </p>

                <p style="
                  font-size:15px;
                  color:#6b7280;
                ">
                  — Team VenZara
                </p>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center"
                style="
                  background:#f3f4f6;
                  padding:20px;
                  font-size:13px;
                  color:#6b7280;
                ">

                © 2026 VenZara Store <br/>
                All Rights Reserved

              </td>
            </tr>

          </table>

        </td>
      </tr>
    </table>

  </div>
`,
      });

      console.log("GOOGLE MAIL SENT");
      } catch (mailError) {
        console.error("Google welcome email failed:", mailError.message);
      }
    }

    // Generate JWT
    const token = createToken(user._id);

    res.json({
      success: true,
      token,
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
  loginUser,
  registerUser,
  adminLogin,
  getUserCart,
  addToCart,
  updateCart,
  googleLogin,
  forgotPassword,
  resetPassword
};