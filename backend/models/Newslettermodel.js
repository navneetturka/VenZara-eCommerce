import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema({

  email: {
    type: String,
    required: true,
    unique: true,
  },

  couponCode: {
    type: String,
    required: true,
  },

  discountPercent: {
    type: Number,
    default: 20,
  },

  used: {
    type: Boolean,
    default: false,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

});

const newsletterModel =
  mongoose.models.newsletter ||
  mongoose.model("newsletter", newsletterSchema);

export default newsletterModel;