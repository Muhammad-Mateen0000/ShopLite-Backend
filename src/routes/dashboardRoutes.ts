import { Router } from "express";

import {
  getUserDashboardController,
} from "../controllers/dashboardController.js";

import {
  authMiddleware,
} from "../middleware/authMiddleware.js";

const router = Router();

router.use(authMiddleware);

router.get(
  "/user",
  getUserDashboardController
);

export default router;