import { z } from "zod";

export const createProductSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1)
    .max(200),

  description: z
    .string()
    .trim()
    .max(2000)
    .optional(),

  price: z
    .coerce
    .number()
    .int()
    .min(0),

  image_url: z
    .string()
    .url()
    .optional()
    .or(z.literal("")),
});

export const updateProductSchema =
  createProductSchema.partial();

export const productIdSchema = z.object({
  id: z.string().uuid(),
});