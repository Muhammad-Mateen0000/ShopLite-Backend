import { z } from "zod";

export const getProductsQuerySchema = z.object({
  search: z.string().trim().optional(),

  minPrice: z.coerce
    .number()
    .int()
    .min(0)
    .optional(),

  maxPrice: z.coerce
    .number()
    .int()
    .min(0)
    .optional(),

  sortBy: z
    .enum(["name", "price", "created_at"])
    .default("created_at"),

  sortOrder: z
    .enum(["asc", "desc"])
    .default("desc"),

  page: z.coerce
    .number()
    .int()
    .min(1)
    .default(1),

  limit: z.coerce
    .number()
    .int()
    .min(1)
    .max(50)
    .default(10),
});