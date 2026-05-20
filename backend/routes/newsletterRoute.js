import express from "express";

import {
  subscribeNewsletter,
  verifyCoupon,
} from "../controllers/newsletterController.js";

import userAuth from "../middleware/userAuth.js";

const newsletterRouter = express.Router();

newsletterRouter.post(
  "/subscribe",
  userAuth,
  subscribeNewsletter
);

newsletterRouter.post(
  "/verify-coupon",
  verifyCoupon
);

export default newsletterRouter;