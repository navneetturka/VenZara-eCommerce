import express from "express";
import {
  addProduct,
  removeProduct,
  updateProduct,
  listProducts,
  singleProduct,
} from "../controllers/productController.js";
import upload from "../middleware/multer.js";
import adminAuth from "../middleware/adminAuth.js";

const productRouter = express.Router();

const imageUpload = upload.fields([
  { name: "image1", maxCount: 1 },
  { name: "image2", maxCount: 1 },
  { name: "image3", maxCount: 1 },
  { name: "image4", maxCount: 1 },
]);

productRouter.post("/add", imageUpload, adminAuth, addProduct);
productRouter.post("/update", imageUpload, adminAuth, updateProduct);

productRouter.post("/remove", adminAuth, removeProduct);
productRouter.post("/single", singleProduct);       // public
productRouter.get("/list", listProducts);           // public

export default productRouter;
