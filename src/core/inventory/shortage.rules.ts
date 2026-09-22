import { suggestCutPlan } from "@/core/inventory/cut-plan.rules"
import type { GlassPiece } from "@/core/inventory/glass-piece.types"
import type { PendingQuote } from "@/core/quotes/quote.types"
import { quantitySchema } from "@/core/shared/quantity"

export type GlassShortage = {
  glassTypeId: number
  shortfallQuantity: number
  affectedQuoteIds: number[]
}

// Simulates cutting every pending quote's line items against current stock,
// in one pass sharing a single running view of inventory — the same
// allocate-and-decrement approach orders/actions.ts uses for one order's line
// items, extended across the whole pending backlog. Nothing is written
// anywhere; this only answers "if every pending quote were approved right
// now, which glass types would come up short, and by how much."
export function findGlassShortages(
  pendingQuotes: PendingQuote[],
  stockByGlassType: Map<number, GlassPiece[]>
): GlassShortage[] {
  const remainingByPieceId = new Map<number, number>()
  const shortageByGlassType = new Map<number, GlassShortage>()

  for (const quote of pendingQuotes) {
    for (const lineItem of quote.lineItems) {
      const pieces = stockByGlassType.get(lineItem.glassTypeId) ?? []
      const available = pieces.flatMap((piece) => {
        const remaining = remainingByPieceId.get(piece.id) ?? piece.quantity
        return remaining > 0
          ? [{ ...piece, quantity: quantitySchema.parse(remaining) }]
          : []
      })

      const plan = suggestCutPlan(
        {
          glassTypeId: lineItem.glassTypeId,
          widthIn: lineItem.widthIn,
          heightIn: lineItem.heightIn,
          quantity: lineItem.quantity,
        },
        available
      )

      for (const allocation of plan.allocations) {
        const remaining = remainingByPieceId.get(allocation.piece.id) ?? allocation.piece.quantity
        remainingByPieceId.set(allocation.piece.id, remaining - allocation.quantityToCut)
      }

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
