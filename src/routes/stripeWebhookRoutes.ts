import { Router } from "express";

import { stripeWebhookController } from "../controllers/stripeWebhookController.js";

const router = Router();

router.post("/", stripeWebhookController);

export default router;