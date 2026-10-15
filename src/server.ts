import "dotenv/config";

import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";

import { errorMiddleware } from "./middleware/errorMiddleware.js";
import { generalRateLimiter } from "./middleware/rateLimitMiddleware.js";

import adminRoutes from "./routes/adminRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import stripeWebhookRoutes from "./routes/stripeWebhookRoutes.js";

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  }),
);

app.use(morgan("dev"));

app.use(generalRateLimiter);

app.get("/", (_req, res) => {
  res.json({
    message: "ShopLite backend is running",
  });
});

/*
 * Stripe webhook must receive the raw request body.
 */
app.use(
  "/api/webhooks/stripe",
  express.raw({
    type: "application/json",
  }),
  stripeWebhookRoutes,
);

app.use(
  express.json({
    limit: "10kb",
  }),
);

app.use("/api/products", productRoutes);

app.use("/api/checkout", checkoutRoutes);

app.use("/api/orders", orderRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/profile", profileRoutes);

app.use("/api/admin", adminRoutes);

app.use(errorMiddleware);

app.listen(env.port, () => {
  console.log(`ShopLite backend running on port ${env.port}`);
});
