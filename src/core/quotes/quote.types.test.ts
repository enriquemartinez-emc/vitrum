import { describe, expect, it } from "vitest"

import {
  approvedQuoteSchema,
  declinedQuoteSchema,
  newQuoteSchema,
  pendingQuoteSchema,
  quoteSchema,
} from "@/core/quotes/quote.types"

const lineItem = {
  id: 1,
  windowTypeId: 1,
  glassTypeId: 1,
  widthIn: 24,
  heightIn: 36,
  quantity: 2,
  unitPrice: 15000,
  lineTotal: 30000,
}

describe("quoteSchema", () => {
  it("parses a pending quote", () => {
    const result = quoteSchema.parse({
      id: 1,
      customerId: 1,
      lineItems: [lineItem],
      status: "pending",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
    })
    expect(result.status).toBe("pending")
  })

  it("requires approvedAt on an approved quote", () => {
    expect(() =>
      approvedQuoteSchema.parse({
        id: 1,
        customerId: 1,
        lineItems: [lineItem],
        status: "approved",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      })
    ).toThrow()
  })

  it("requires declinedAt on a declined quote", () => {
    expect(() =>
      declinedQuoteSchema.parse({
        id: 1,
        customerId: 1,
        lineItems: [lineItem],
        status: "declined",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      })
    ).toThrow()
  })

  it("rejects a quote with no line items", () => {
    expect(() =>
      pendingQuoteSchema.parse({
        id: 1,
        customerId: 1,
        lineItems: [],
        status: "pending",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      })
    ).toThrow()
  })

  it("rejects a status the union doesn't recognize", () => {
    expect(() =>
      quoteSchema.parse({
        id: 1,
        customerId: 1,
        lineItems: [lineItem],
        status: "installed",
        createdAt: "2026-01-01T00:00:00Z",
        updatedAt: "2026-01-01T00:00:00Z",
      })
    ).toThrow()
  })
})

describe("newQuoteSchema", () => {
  it("requires at least one line item", () => {
    expect(() =>
      newQuoteSchema.parse({ customerId: 1, lineItems: [] })
    ).toThrow()
  })

  it("accepts a customer with one or more line items", () => {
    const result = newQuoteSchema.parse({
      customerId: 1,
      lineItems: [
        { windowTypeId: 1, glassTypeId: 1, widthIn: 24, heightIn: 36, quantity: 2 },
      ],
    })
    expect(result.lineItems).toHaveLength(1)
  })
})
