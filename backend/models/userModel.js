import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    isSubscribed: {
  type: Boolean,
  default: false,
},

couponCode: {
  type: String,
  default: "",
},

    // ✅ NEW FIELDS
    resetToken: { type: String },
    resetTokenExpire: { type: Date },
  },
  { minimize: false }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
