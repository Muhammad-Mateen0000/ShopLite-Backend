import type { Request, Response } from "express";

import type {
  AuthenticatedRequest,
} from "../middleware/authMiddleware.js";

import {
  getUserDashboard,
} from "../services/dashboardService.js";

export async function getUserDashboardController(
  req: Request,
  res: Response
) {
  const authenticatedRequest =
    req as AuthenticatedRequest;

  if (!authenticatedRequest.user) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const dashboard = await getUserDashboard(
    authenticatedRequest.user.id
  );

  return res.status(200).json({
    success: true,
    dashboard,
  });
}