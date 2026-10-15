import Stripe from "stripe";

import { env } from "./env.js";

export const stripe: Stripe = new Stripe(env.stripeSecretKey);