import { z } from "zod"

import { quoteIdSchema } from "@/core/quotes/quote.types"

export const orderIdSchema = z.number().int().positive().brand<"OrderId">()
export type OrderId = z.infer<typeof orderIdSchema>

export const orderStatusSchema = z.enum(["scheduled", "complete"])
export type OrderStatus = z.infer<typeof orderStatusSchema>

const baseOrderSchema = z.object({
  id: orderIdSchema,
  quoteId: quoteIdSchema,
  installationDate: z.iso.date(),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
})

export const scheduledOrderSchema = baseOrderSchema.extend({
  status: z.literal("scheduled"),
})
export type ScheduledOrder = z.infer<typeof scheduledOrderSchema>

export const completedOrderSchema = baseOrderSchema.extend({
  status: z.literal("complete"),
  completedAt: z.iso.datetime({ offset: true }),
})
export type CompletedOrder = z.infer<typeof completedOrderSchema>

export const orderSchema = z.discriminatedUnion("status", [
  scheduledOrderSchema,
  completedOrderSchema,
])
export type Order = z.infer<typeof orderSchema>
