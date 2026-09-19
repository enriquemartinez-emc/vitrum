import type { GlassType } from "@/core/products/glass-type.types"
import type { WindowType } from "@/core/products/window-type.types"
import type {
  ApprovedQuote,
  DeclinedQuote,
  NewQuoteLineItem,
  PendingQuote,
  QuoteLineItem,
} from "@/core/quotes/quote.types"
import { areaSqFt } from "@/core/shared/dimensions"
import { moneySchema, type Money } from "@/core/shared/money"

export function priceLineItem(
  lineItem: Pick<NewQuoteLineItem, "widthIn" | "heightIn" | "quantity">,
  windowType: WindowType,
  glassType: GlassType
): { unitPrice: Money; lineTotal: Money } {
  const glassCost = areaSqFt(lineItem) * glassType.pricePerSqFt
  const unitPrice = moneySchema.parse(Math.round(windowType.laborCost + glassCost))
  const lineTotal = moneySchema.parse(unitPrice * lineItem.quantity)

  return { unitPrice, lineTotal }
}

export function quoteTotal(lineItems: Pick<QuoteLineItem, "lineTotal">[]): Money {
  return moneySchema.parse(
    lineItems.reduce((sum, lineItem) => sum + lineItem.lineTotal, 0)
  )
}

export function approveQuote(
  quote: PendingQuote,
  approvedAt: string
): ApprovedQuote {
  return {
    id: quote.id,
    customerId: quote.customerId,
    lineItems: quote.lineItems,
    createdAt: quote.createdAt,
    updatedAt: quote.updatedAt,
    status: "approved",
    approvedAt,
  }
}

export function declineQuote(
  quote: PendingQuote,
  declinedAt: string
): DeclinedQuote {
  return {
    id: quote.id,
    customerId: quote.customerId,
    lineItems: quote.lineItems,
    createdAt: quote.createdAt,
    updatedAt: quote.updatedAt,
    status: "declined",
    declinedAt,
  }
}
