import { z } from "zod"

import { customerIdSchema } from "@/core/customers/customer.types"
import { glassTypeIdSchema } from "@/core/products/glass-type.types"
import { windowTypeIdSchema } from "@/core/products/window-type.types"
import { inchesSchema } from "@/core/shared/dimensions"
import { moneySchema } from "@/core/shared/money"
import { quantitySchema } from "@/core/shared/quantity"

export const quoteIdSchema = z.number().int().positive().brand<"QuoteId">()
export type QuoteId = z.infer<typeof quoteIdSchema>

export const quoteLineItemIdSchema = z
  .number()
  .int()
  .positive()
  .brand<"QuoteLineItemId">()
export type QuoteLineItemId = z.infer<typeof quoteLineItemIdSchema>

export const newQuoteLineItemSchema = z.object({
  windowTypeId: windowTypeIdSchema,
  glassTypeId: glassTypeIdSchema,
  widthIn: inchesSchema,
  heightIn: inchesSchema,
  quantity: quantitySchema,
})
export type NewQuoteLineItem = z.infer<typeof newQuoteLineItemSchema>

export const quoteLineItemSchema = newQuoteLineItemSchema.extend({
  id: quoteLineItemIdSchema,
  unitPrice: moneySchema,
  lineTotal: moneySchema,
})
export type QuoteLineItem = z.infer<typeof quoteLineItemSchema>

const baseQuoteSchema = z.object({
  id: quoteIdSchema,
  customerId: customerIdSchema,
  lineItems: z.array(quoteLineItemSchema).min(1),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
})

export const pendingQuoteSchema = baseQuoteSchema.extend({
  status: z.literal("pending"),
})
export type PendingQuote = z.infer<typeof pendingQuoteSchema>

export const approvedQuoteSchema = baseQuoteSchema.extend({
  status: z.literal("approved"),
  approvedAt: z.iso.datetime({ offset: true }),
})
export type ApprovedQuote = z.infer<typeof approvedQuoteSchema>

export const declinedQuoteSchema = baseQuoteSchema.extend({
  status: z.literal("declined"),
  declinedAt: z.iso.datetime({ offset: true }),
})
export type DeclinedQuote = z.infer<typeof declinedQuoteSchema>

export const quoteSchema = z.discriminatedUnion("status", [
  pendingQuoteSchema,
  approvedQuoteSchema,
  declinedQuoteSchema,
])
export type Quote = z.infer<typeof quoteSchema>

export const newQuoteSchema = z.object({
  customerId: customerIdSchema,
  lineItems: z.array(newQuoteLineItemSchema).min(1),
})
export type NewQuote = z.infer<typeof newQuoteSchema>
