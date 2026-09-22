import { describe, expect, it } from "vitest"

import { findGlassShortages } from "@/core/inventory/shortage.rules"
import { glassPieceSchema } from "@/core/inventory/glass-piece.types"
import { pendingQuoteSchema } from "@/core/quotes/quote.types"
import type { PendingQuote } from "@/core/quotes/quote.types"

function piece(id: number, glassTypeId: number, widthIn: number, heightIn: number, quantity: number) {
  return glassPieceSchema.parse({
    id,
    glassTypeId,
    widthIn,
    heightIn,
    quantity,
    origin: "shipment",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  })
}

function pendingQuote(
  id: number,
  lineItems: { glassTypeId: number; widthIn: number; heightIn: number; quantity: number }[]
): PendingQuote {
  return pendingQuoteSchema.parse({
    id,
    customerId: 1,
    status: "pending",
    lineItems: lineItems.map((item, index) => ({
      id: id * 100 + index,
      windowTypeId: 1,
      glassTypeId: item.glassTypeId,
      widthIn: item.widthIn,
      heightIn: item.heightIn,
      quantity: item.quantity,
      unitPrice: 10000,
      lineTotal: 10000 * item.quantity,
    })),
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  })
}

describe("findGlassShortages", () => {
  it("reports no shortage when stock covers all pending demand", () => {
    const stock = new Map([[1, [piece(1, 1, 24, 36, 5)]]])
    const quotes = [pendingQuote(1, [{ glassTypeId: 1, widthIn: 24, heightIn: 36, quantity: 2 }])]

    expect(findGlassShortages(quotes, stock)).toEqual([])
  })

  it("reports a shortage when a single quote's demand exceeds stock", () => {
    const stock = new Map([[1, [piece(1, 1, 24, 36, 1)]]])
    const quotes = [pendingQuote(1, [{ glassTypeId: 1, widthIn: 24, heightIn: 36, quantity: 3 }])]

    expect(findGlassShortages(quotes, stock)).toEqual([
      { glassTypeId: 1, shortfallQuantity: 2, affectedQuoteIds: [1] },
    ])
  })

  it("returns an empty array when there are no pending quotes", () => {
    const stock = new Map([[1, [piece(1, 1, 24, 36, 5)]]])
    expect(findGlassShortages([], stock)).toEqual([])
  })

  it("shares one running view of inventory, so an earlier quote can exhaust stock for a later one", () => {
    const stock = new Map([[1, [piece(1, 1, 24, 36, 2)]]])
    const quotes = [
      pendingQuote(1, [{ glassTypeId: 1, widthIn: 24, heightIn: 36, quantity: 2 }]),
      pendingQuote(2, [{ glassTypeId: 1, widthIn: 24, heightIn: 36, quantity: 1 }]),
    ]

    expect(findGlassShortages(quotes, stock)).toEqual([
      { glassTypeId: 1, shortfallQuantity: 1, affectedQuoteIds: [2] },
    ])
  })

  it("aggregates shortfall and affected quotes when multiple quotes are short on the same glass type", () => {
    const stock = new Map([[1, [piece(1, 1, 24, 36, 1)]]])
    const quotes = [
      pendingQuote(1, [{ glassTypeId: 1, widthIn: 24, heightIn: 36, quantity: 2 }]),
      pendingQuote(2, [{ glassTypeId: 1, widthIn: 24, heightIn: 36, quantity: 3 }]),
    ]

    expect(findGlassShortages(quotes, stock)).toEqual([
      { glassTypeId: 1, shortfallQuantity: 4, affectedQuoteIds: [1, 2] },
    ])
  })

  it("tracks shortages per glass type independently", () => {
    const stock = new Map([
      [1, [piece(1, 1, 24, 36, 5)]],
      [2, [piece(2, 2, 24, 36, 1)]],
    ])
    const quotes = [
      pendingQuote(1, [
        { glassTypeId: 1, widthIn: 24, heightIn: 36, quantity: 1 },
        { glassTypeId: 2, widthIn: 24, heightIn: 36, quantity: 3 },
      ]),
    ]

    expect(findGlassShortages(quotes, stock)).toEqual([
      { glassTypeId: 2, shortfallQuantity: 2, affectedQuoteIds: [1] },
    ])
  })

  it("reports no shortage for a glass type with no stock loaded at all", () => {
    const stock = new Map<number, never[]>()
    const quotes = [pendingQuote(1, [{ glassTypeId: 1, widthIn: 24, heightIn: 36, quantity: 1 }])]

    expect(findGlassShortages(quotes, stock)).toEqual([
      { glassTypeId: 1, shortfallQuantity: 1, affectedQuoteIds: [1] },
    ])
  })
})
