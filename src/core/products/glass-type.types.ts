import { z } from "zod"

import { moneySchema } from "@/core/shared/money"

const nameSchema = z
  .string()
  .trim()
  .min(1, "Required")
  .max(100, "Must be 100 characters or fewer")
  .brand<"GlassTypeName">()
export type GlassTypeName = z.infer<typeof nameSchema>

export const glassTypeIdSchema = z.number().int().positive().brand<"GlassTypeId">()
export type GlassTypeId = z.infer<typeof glassTypeIdSchema>

export const glassTypeSchema = z.object({
  id: glassTypeIdSchema,
  name: nameSchema,
  pricePerSqFt: moneySchema,
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
})
export type GlassType = z.infer<typeof glassTypeSchema>

export const newGlassTypeSchema = z.object({
  name: nameSchema,
  pricePerSqFt: moneySchema,
})
export type NewGlassType = z.infer<typeof newGlassTypeSchema>

export const glassTypeDetailsSchema = newGlassTypeSchema
export type GlassTypeDetails = z.infer<typeof glassTypeDetailsSchema>
