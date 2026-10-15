import { Router } from "express";

import {
  getProfileController,
  updateProfileController,
  uploadAvatarController,
} from "../controllers/profileController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { uploadImage } from "../middleware/uploadMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get(
  "/",
  getProfileController
);

router.put(
  "/",
  updateProfileController
);

router.post(
  "/avatar",
  uploadImage.single("image"),
  uploadAvatarController
);

export default router;