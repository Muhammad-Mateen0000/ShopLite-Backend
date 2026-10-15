import type {
  NextFunction,
  Request,
  Response,
} from "express";

import type {
  AuthenticatedRequest,
} from "./authMiddleware.js";

import { supabase } from "../config/supabase.js";

export async function adminMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authenticatedRequest =
    req as AuthenticatedRequest;

  if (!authenticatedRequest.user) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const { data: profile, error } =
    await supabase
      .from("profiles")
      .select("role")
      .eq("id", authenticatedRequest.user.id)
      .single();

  if (error || !profile) {
    return res.status(403).json({
      message: "Admin access required",
    });
  }

  if (profile.role !== "admin") {
    return res.status(403).json({
      message: "Admin access required",
    });
  }

  next();
}