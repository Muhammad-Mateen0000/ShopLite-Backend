import type { Request, Response } from "express";
import Stripe from "stripe";

import { env } from "../config/env.js";
import { stripe } from "../config/stripe.js";
import { handleStripeWebhookEvent } from "../services/stripeWebhookService.js";

export async function stripeWebhookController(
  req: Request,
  res: Response
) {
  const signature = req.headers["stripe-signature"];

  if (!signature || Array.isArray(signature)) {
    return res.status(400).json({
      message: "Missing Stripe signature",
    });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      env.stripeWebhookSecret
    );
  } catch (error) {
    console.error("Stripe webhook signature verification failed", error);

    return res.status(400).json({
      message: "Invalid Stripe signature",
    });
  }

  try {
    await handleStripeWebhookEvent(event);

    return res.status(200).json({
      received: true,
    });
  } catch (error) {
    console.error("Stripe webhook processing failed", error);

    return res.status(500).json({
      message: "Webhook processing failed",
    });
  }
}