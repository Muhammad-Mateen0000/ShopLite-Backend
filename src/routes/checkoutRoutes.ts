import { Router } from "express";

import { createCheckoutSessionController } from "../controllers/checkoutController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { checkoutRateLimiter } from "../middleware/rateLimitMiddleware.js";

const router = Router();

router.post(
  "/create-session",
  checkoutRateLimiter,
  authMiddleware,
  createCheckoutSessionController
);

export default router;