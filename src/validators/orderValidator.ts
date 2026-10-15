import { z } from "zod";

export const getOrdersQuerySchema = z.object({
  status: z
    .enum(["pending", "paid", "failed"])
    .optional(),

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