import { Router } from "express";

import {
  getOrderByIdController,
  getOrdersController,
} from "../controllers/orderController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", authMiddleware, getOrdersController);

router.get("/:id", authMiddleware, getOrderByIdController);

export default router;