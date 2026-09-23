import { allocateFromRunningStock } from "@/core/inventory/cut-plan.rules"
import type { GlassPiece } from "@/core/inventory/glass-piece.types"
import type { PendingQuote } from "@/core/quotes/quote.types"

export type GlassShortage = {
  glassTypeId: number
  shortfallQuantity: number
  affectedQuoteIds: number[]
}

// Simulates cutting every pending quote's line items against current stock,
// in one pass sharing a single running view of inventory via
// allocateFromRunningStock — the same allocation primitive orders/actions.ts
// uses for one order's line items, extended across the whole pending
// backlog. Nothing is written anywhere; this only answers "if every pending
// quote were approved right now, which glass types would come up short, and
// by how much."
export function findGlassShortages(
  pendingQuotes: PendingQuote[],
  stockByGlassType: Map<number, GlassPiece[]>
): GlassShortage[] {
  const remainingByPieceId = new Map<number, number>()
  const shortageByGlassType = new Map<number, GlassShortage>()

  for (const quote of pendingQuotes) {
    for (const lineItem of quote.lineItems) {
      const candidates = stockByGlassType.get(lineItem.glassTypeId) ?? []

      const plan = allocateFromRunningStock(
        {
          glassTypeId: lineItem.glassTypeId,
          widthIn: lineItem.widthIn,
          heightIn: lineItem.heightIn,
          quantity: lineItem.quantity,
        },
        candidates,
        remainingByPieceId
      )

      if (plan.status === "partial") {
        const existing = shortageByGlassType.get(lineItem.glassTypeId)
        if (existing) {
          existing.shortfallQuantity += plan.unfulfilledQuantity
          if (!existing.affectedQuoteIds.includes(quote.id)) {
            existing.affectedQuoteIds.push(quote.id)
          }
        } else {
          shortageByGlassType.set(lineItem.glassTypeId, {
            glassTypeId: lineItem.glassTypeId,
            shortfallQuantity: plan.unfulfilledQuantity,
            affectedQuoteIds: [quote.id],
          })
        }
      }
    }
  }

  return Array.from(shortageByGlassType.values())
}
