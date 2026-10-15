import { Router } from "express";

import {
  createProductController,
  deleteProductController,
  getAdminCustomersController,
  getAdminOrdersController,
  getAdminStatsController,
  updateProductController,
} from "../controllers/adminController.js";

import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminMiddleware } from "../middleware/adminMiddleware.js";

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get(
  "/stats",
  getAdminStatsController
);

router.get(
  "/orders",
  getAdminOrdersController
);

router.get(
  "/customers",
  getAdminCustomersController
);

router.post(
  "/products",
  createProductController
);

router.put(
  "/products/:id",
  updateProductController
);

router.delete(
  "/products/:id",
  deleteProductController
);

export default router;