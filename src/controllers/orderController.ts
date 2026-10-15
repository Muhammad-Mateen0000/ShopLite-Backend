import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";
import {
  getUserOrderById,
  getUserOrders,
} from "../services/orderService.js";
import { getOrdersQuerySchema } from "../validators/orderValidator.js";

export async function getOrdersController(
  req: Request,
  res: Response
) {
  const validation = getOrdersQuerySchema.safeParse(req.query);

  if (!validation.success) {
    return res.status(400).json({
      message: "Invalid query parameters",
      errors: validation.error.flatten().fieldErrors,
    });
  }

  const authenticatedRequest = req as AuthenticatedRequest;

  const result = await getUserOrders({
    userId: authenticatedRequest.user.id,
    ...validation.data,
  });

  return res.status(200).json({
    success: true,
    ...result,
  });
}

export async function getOrderByIdController(
  req: Request,
  res: Response
) {
  const orderId = req.params.id;

  if (typeof orderId !== "string" || !orderId) {
    return res.status(400).json({
      message: "Invalid order ID",
    });
  }

  const authenticatedRequest = req as AuthenticatedRequest;

  const order = await getUserOrderById(
    authenticatedRequest.user.id,
    orderId
  );

  if (!order) {
    return res.status(404).json({
      message: "Order not found",
    });
  }

  return res.status(200).json({
    success: true,
    order,
  });
}