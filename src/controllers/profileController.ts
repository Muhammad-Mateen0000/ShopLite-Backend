import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";

import {
  getProfile,
  updateProfile,
  uploadAvatar,
} from "../services/profileService.js";

import {
  updateProfileSchema,
} from "../validators/profileValidator.js";

export async function getProfileController(
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

  const profile = await getProfile(
    authenticatedRequest.user.id
  );

  if (!profile) {
    return res.status(404).json({
      message: "Profile not found",
    });
  }

  return res.status(200).json({
    success: true,
    profile,
  });
}

export async function updateProfileController(
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

  const validation =
    updateProfileSchema.safeParse(req.body);

  if (!validation.success) {
    return res.status(400).json({
      message: "Invalid profile data",
      errors:
        validation.error.flatten().fieldErrors,
    });
  }

  const profile = await updateProfile(
    authenticatedRequest.user.id,
    validation.data
  );

  return res.status(200).json({
    success: true,
    profile,
  });
}

export async function uploadAvatarController(
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

  if (!req.file) {
    return res.status(400).json({
      message: "Profile image is required",
    });
  }

  const profile = await uploadAvatar(
    authenticatedRequest.user.id,
    req.file
  );

  return res.status(200).json({
    success: true,
    profile,
  });
}