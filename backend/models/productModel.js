import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },

  description: { type: String, required: true },

  price: { type: Number, required: true },

  image: { type: Array, required: true }, // Array of Cloudinary image URLs

  category: {
    type: String,
    required: true,
  }, // Men, Women, Kids

  subCategory: {
    type: String,
    required: true,
  }, // Topwear, Bottomwear, Winterwear, Accessories, Shoes

  sizes: {
    type: Array,
    required: true,
  }, // ["S","M","L","XL","XXL"]

  bestseller: {
    type: Boolean,
    default: false,
  },

  date: {
    type: Number,
    required: true,
  }, // Date.now() timestamp
});

const productModel =
  mongoose.models.product ||
  mongoose.model("product", productSchema);

export default productModel;