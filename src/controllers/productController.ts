import type { Request, Response } from "express";

import type { AuthenticatedRequest } from "../middleware/authMiddleware.js";

import { getProductById, getProducts } from "../services/productService.js";

import { uploadProductImage } from "../services/productImageService.js";

import { getProductsQuerySchema } from "../validators/productValidator.js";

export async function getProductsController(req: Request, res: Response) {
  const validation = getProductsQuerySchema.safeParse(req.query);

  if (!validation.success) {
    return res.status(400).json({
      message: "Invalid query parameters",
      errors: validation.error.flatten().fieldErrors,
    });
  }

  const result = await getProducts(validation.data);

  return res.status(200).json({
    success: true,
    ...result,
  });
}

export async function getProductByIdController(req: Request, res: Response) {
  const productId = req.params.id;

  if (typeof productId !== "string" || !productId) {
    return res.status(400).json({
      message: "Invalid product ID",
    });
  }

  const product = await getProductById(productId);

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

export async function uploadProductImageController(
  req: Request,
  res: Response,
) {
  const authenticatedRequest = req as AuthenticatedRequest;

  const productId = req.params.id;

  if (typeof productId !== "string" || !productId) {
    return res.status(400).json({
      message: "Invalid product ID",
    });
  }

  if (!authenticatedRequest.user) {
    return res.status(401).json({
      message: "Authentication required",
    });
  }

  if (!req.file) {
    return res.status(400).json({
      message: "Product image is required",
    });
  }

  const product = await uploadProductImage(productId, req.file);

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
