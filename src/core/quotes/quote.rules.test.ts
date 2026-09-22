import { describe, expect, it } from "vitest"

import { customerSchema } from "@/core/customers/customer.types"
import { glassTypeSchema } from "@/core/products/glass-type.types"
import { windowTypeSchema } from "@/core/products/window-type.types"
import {
  approveQuote,
  declineQuote,
  priceLineItem,
  quoteTotal,
  resolveQuoteDraft,
} from "@/core/quotes/quote.rules"
import { newQuoteLineItemSchema, pendingQuoteSchema } from "@/core/quotes/quote.types"
import { moneySchema } from "@/core/shared/money"

function cutSize(widthIn: number, heightIn: number, quantity: number) {
  return newQuoteLineItemSchema
    .pick({ widthIn: true, heightIn: true, quantity: true })
    .parse({ widthIn, heightIn, quantity })
}

const windowType = windowTypeSchema.parse({
  id: 1,
  name: "Awning",
  laborCost: 10500,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
})

const glassType = glassTypeSchema.parse({
  id: 1,
  name: "Tempered",
  pricePerSqFt: 1250,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
})

describe("priceLineItem", () => {
  it("prices a unit as labor cost plus glass area times price per sq ft", () => {
    // 24x36in = 6 sqft exactly, so glass cost = 6 * 1250 = 7500 cents.
    const { unitPrice, lineTotal } = priceLineItem(
      cutSize(24, 36, 2),
      windowType,
      glassType
    )
    expect(unitPrice).toBe(10500 + 7500)
    expect(lineTotal).toBe((10500 + 7500) * 2)
  })

  it("rounds fractional glass cost from non-exact dimensions", () => {
    const { unitPrice } = priceLineItem(
      cutSize(25, 37, 1),
      windowType,
      glassType
    )
    // 25*37/144 = 6.423 sqft * 1250 = 8029.86 -> rounds to 8030.
    expect(unitPrice).toBe(10500 + 8030)
  })
})

describe("quoteTotal", () => {
  it("sums the line totals", () => {
    expect(
      quoteTotal([
        { lineTotal: moneySchema.parse(18000) },
        { lineTotal: moneySchema.parse(9500) },
      ])
    ).toBe(27500)
  })
})

const pending = pendingQuoteSchema.parse({
  id: 1,
  customerId: 1,
  status: "pending",
  lineItems: [
    {
      id: 1,
      windowTypeId: 1,
      glassTypeId: 1,
      widthIn: 24,
      heightIn: 36,
      quantity: 1,
      unitPrice: 18000,
      lineTotal: 18000,
    },
  ],
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
})

describe("approveQuote", () => {
  it("carries every field forward and adds approvedAt", () => {
    const approved = approveQuote(pending, "2026-01-05T00:00:00Z")
    expect(approved.status).toBe("approved")
    expect(approved.approvedAt).toBe("2026-01-05T00:00:00Z")
    expect(approved.lineItems).toBe(pending.lineItems)
    expect(approved.id).toBe(pending.id)
  })
})

describe("declineQuote", () => {
  it("carries every field forward and adds declinedAt", () => {
    const declined = declineQuote(pending, "2026-01-05T00:00:00Z")
    expect(declined.status).toBe("declined")
    expect(declined.declinedAt).toBe("2026-01-05T00:00:00Z")
    expect(declined.customerId).toBe(pending.customerId)
  })
})

const customer = customerSchema.parse({
  id: 1,
  firstName: "Maria",
  lastName: "Gonzalez",
  phoneNumber: "555-123-4567",
  address: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
})

describe("resolveQuoteDraft", () => {
  const catalog = { customers: [customer], windowTypes: [windowType], glassTypes: [glassType] }
  const validLineItem = {
    windowTypeId: windowType.id,
    glassTypeId: glassType.id,
    widthIn: 24,
    heightIn: 36,
    quantity: 2,
  }

  it("resolves a line item whose ids exist in the catalog", () => {
    const resolved = resolveQuoteDraft(
      { customerId: customer.id, lineItems: [validLineItem] },
      catalog
    )
    expect(resolved.matchedCustomerId).toBe(customer.id)
    expect(resolved.lineItems).toEqual([validLineItem])
  })

  it("drops a line item whose windowTypeId doesn't exist in the catalog", () => {
    const resolved = resolveQuoteDraft(
      { customerId: null, lineItems: [{ ...validLineItem, windowTypeId: 999 }] },
      catalog
    )
    expect(resolved.lineItems).toEqual([])
  })

  it("drops a line item whose glassTypeId doesn't exist in the catalog", () => {
    const resolved = resolveQuoteDraft(
      { customerId: null, lineItems: [{ ...validLineItem, glassTypeId: 999 }] },
      catalog
    )
    expect(resolved.lineItems).toEqual([])
  })

  it("drops a line item with an out-of-range dimension", () => {
    const resolved = resolveQuoteDraft(
      { customerId: null, lineItems: [{ ...validLineItem, widthIn: 0 }] },
      catalog
    )
    expect(resolved.lineItems).toEqual([])
  })

  it("drops a line item with a non-positive quantity", () => {
    const resolved = resolveQuoteDraft(
      { customerId: null, lineItems: [{ ...validLineItem, quantity: 0 }] },
      catalog
    )
    expect(resolved.lineItems).toEqual([])
  })

  it("keeps the valid line items and drops only the invalid ones", () => {
    const resolved = resolveQuoteDraft(
      {
        customerId: null,
        lineItems: [validLineItem, { ...validLineItem, windowTypeId: 999 }],
      },
      catalog
    )
    expect(resolved.lineItems).toEqual([validLineItem])
  })

  it("resolves matchedCustomerId to null when no customerId is given", () => {
    const resolved = resolveQuoteDraft({ customerId: null, lineItems: [] }, catalog)
    expect(resolved.matchedCustomerId).toBeNull()
  })

  it("resolves matchedCustomerId to null when the customerId doesn't match any customer", () => {
    const resolved = resolveQuoteDraft({ customerId: 999, lineItems: [] }, catalog)
    expect(resolved.matchedCustomerId).toBeNull()
  })
})
