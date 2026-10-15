import type { NextFunction, Request, Response } from "express";

import { supabase } from "../config/supabase.js";

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email?: string;
  };
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const token = authorization.substring(7);

  if (!token) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }

  (req as AuthenticatedRequest).user = {
    id: data.user.id,
    email: data.user.email,
  };

  next();
}