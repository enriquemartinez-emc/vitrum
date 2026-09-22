import type { Customer } from "@/core/customers/customer.types"
import type { GlassType } from "@/core/products/glass-type.types"
import type { WindowType } from "@/core/products/window-type.types"
import type {
  ApprovedQuote,
  DeclinedQuote,
  NewQuoteLineItem,
  PendingQuote,
  QuoteDraftCandidate,
  QuoteDraftLineItem,
  QuoteLineItem,
} from "@/core/quotes/quote.types"
import { areaSqFt, inchesSchema } from "@/core/shared/dimensions"
import { moneySchema, type Money } from "@/core/shared/money"
import { quantitySchema } from "@/core/shared/quantity"

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

// Resolves an unvalidated draft (e.g. from an AI extraction) against the real
// catalog: every id must exist and every dimension/quantity must be in range,
// or that line item is dropped rather than trusted. A candidate customerId
// that matches no customer resolves to null, same as a missing one.
export function resolveQuoteDraft(
  candidate: QuoteDraftCandidate,
  catalog: { customers: Customer[]; windowTypes: WindowType[]; glassTypes: GlassType[] }
): { matchedCustomerId: number | null; lineItems: QuoteDraftLineItem[] } {
  const lineItems: QuoteDraftLineItem[] = []

  for (const item of candidate.lineItems) {
    const windowType = catalog.windowTypes.find((w) => w.id === item.windowTypeId)
    const glassType = catalog.glassTypes.find((g) => g.id === item.glassTypeId)
    const widthIn = inchesSchema.safeParse(item.widthIn)
    const heightIn = inchesSchema.safeParse(item.heightIn)
    const quantity = quantitySchema.safeParse(item.quantity)

    if (!windowType || !glassType || !widthIn.success || !heightIn.success || !quantity.success) {
      continue
    }

    lineItems.push({
      windowTypeId: windowType.id,
      glassTypeId: glassType.id,
      widthIn: widthIn.data,
      heightIn: heightIn.data,
      quantity: quantity.data,
    })
  }

  const matchedCustomer = candidate.customerId
    ? (catalog.customers.find((c) => c.id === candidate.customerId) ?? null)
    : null

  return { matchedCustomerId: matchedCustomer?.id ?? null, lineItems }
}
