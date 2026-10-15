import type { Request, Response } from "express";

import { createCheckoutSession } from "../services/checkoutService.js";
import { createCheckoutSessionSchema } from "../validators/checkoutValidator.js";
import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";

export async function createCheckoutSessionController(
  req: Request,
  res: Response
) {
  const validation = createCheckoutSessionSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Invalid checkout data",
      errors: validation.error.flatten().fieldErrors,
    });
  }

  const authenticatedRequest = req as AuthenticatedRequest;

  const result = await createCheckoutSession(
    authenticatedRequest.user.id,
    validation.data.items
  );

  return res.status(200).json({
    success: true,
    ...result,
  });
}