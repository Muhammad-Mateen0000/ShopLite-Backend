import type { Request, Response } from "express";

import {
  createProduct,
  deleteProduct,
  getAdminCustomers,
  getAdminOrders,
  getAdminStats,
  updateProduct,
} from "../services/adminService.js";

import {
  createProductSchema,
  productIdSchema,
  updateProductSchema,
} from "../validators/adminValidator.js";

export async function getAdminStatsController(
  _req: Request,
  res: Response,
) {
  const dashboard = await getAdminStats();

  return res.status(200).json({
    success: true,
    stats: dashboard.stats,
    revenue: dashboard.revenue,
    topProducts: dashboard.topProducts,
  });
}

export async function getAdminOrdersController(
  _req: Request,
  res: Response,
) {
  const orders = await getAdminOrders();

  return res.status(200).json({
    success: true,
    orders,
  });
}

export async function getAdminCustomersController(
  _req: Request,
  res: Response,
) {
  const customers = await getAdminCustomers();

  return res.status(200).json({
    success: true,
    customers,
  });
}

export async function createProductController(
  req: Request,
  res: Response,
) {
  const validation = createProductSchema.safeParse(
    req.body,
  );

  if (!validation.success) {
    return res.status(400).json({
      message: "Invalid product data",
      errors:
        validation.error.flatten().fieldErrors,
    });
  }

  const product = await createProduct(
    validation.data,
  );

  return res.status(201).json({
    success: true,
    product,
  });
}

export async function updateProductController(
  req: Request,
  res: Response,
) {
  const idValidation = productIdSchema.safeParse(
    req.params,
  );

  if (!idValidation.success) {
    return res.status(400).json({
      message: "Invalid product ID",
    });
  }

  const bodyValidation =
    updateProductSchema.safeParse(req.body);

  if (!bodyValidation.success) {
    return res.status(400).json({
      message: "Invalid product data",
      errors:
        bodyValidation.error.flatten().fieldErrors,
    });
  }

  const product = await updateProduct(
    idValidation.data.id,
    bodyValidation.data,
  );

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  return res.status(200).json({
    success: true,
    product,
  });
}

export async function deleteProductController(
  req: Request,
  res: Response,
) {
  const validation = productIdSchema.safeParse(
    req.params,
  );

  if (!validation.success) {
    return res.status(400).json({
      message: "Invalid product ID",
    });
  }

  const deleted = await deleteProduct(
    validation.data.id,
  );

  if (!deleted) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Product deleted successfully",
  });
}