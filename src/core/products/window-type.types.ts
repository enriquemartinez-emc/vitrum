import { z } from "zod"

import { moneySchema } from "@/core/shared/money"

const nameSchema = z
  .string()
  .trim()
  .min(1, "Required")
  .max(100, "Must be 100 characters or fewer")
  .brand<"WindowTypeName">()
export type WindowTypeName = z.infer<typeof nameSchema>

export const windowTypeIdSchema = z.number().int().positive().brand<"WindowTypeId">()
export type WindowTypeId = z.infer<typeof windowTypeIdSchema>

export const windowTypeSchema = z.object({
  id: windowTypeIdSchema,
  name: nameSchema,
  laborCost: moneySchema,
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
})
export type WindowType = z.infer<typeof windowTypeSchema>

export const newWindowTypeSchema = z.object({
  name: nameSchema,
  laborCost: moneySchema,
})
export type NewWindowType = z.infer<typeof newWindowTypeSchema>
