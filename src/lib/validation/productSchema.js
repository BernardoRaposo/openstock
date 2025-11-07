import { z } from "zod"

export const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().optional(),
  category: z.string().optional(),
  quantity: z.number().int().min(0),
  price: z.number().min(0),
  cost: z.number().min(0).optional(),
})
