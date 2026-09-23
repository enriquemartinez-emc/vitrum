import "server-only"

import { glassTypeIdSchema } from "@/core/products/glass-type.types"
import { findGlassShortages } from "@/core/inventory/shortage.rules"
import type { GlassPiece } from "@/core/inventory/glass-piece.types"
import * as inventoryRepository from "@/features/inventory/repository"
import * as glassTypesRepository from "@/features/products/glass-types.repository"
import * as quotesRepository from "@/features/quotes/repository"

export type ShortageDigestItem = {
  glassTypeId: number
  glassTypeName: string
  shortfallQuantity: number
  affectedQuoteCount: number
  oldestPendingDays: number
}

const MS_PER_DAY = 86_400_000

// Free to call as often as needed — no AI involved. Only the narration on
// top of this (see ai/narration.ts) costs anything, and is opt-in.
export async function computeShortageDigest(): Promise<ShortageDigestItem[]> {
  const pendingQuotes = await quotesRepository.listPendingQuotes()
  if (pendingQuotes.length === 0) return []

  const glassTypeIds = new Set<number>()
  for (const quote of pendingQuotes) {
    for (const lineItem of quote.lineItems) glassTypeIds.add(lineItem.glassTypeId)
  }

  const stockByGlassType = new Map<number, GlassPiece[]>()
  await Promise.all(
    Array.from(glassTypeIds).map(async (id) => {
      stockByGlassType.set(
        id,
        await inventoryRepository.listGlassPiecesByType(glassTypeIdSchema.parse(id))
      )
    })
  )

  const shortages = findGlassShortages(pendingQuotes, stockByGlassType)
  if (shortages.length === 0) return []

  const glassTypes = await glassTypesRepository.listAllGlassTypes()
  const glassTypeNameById = new Map<number, string>(
    glassTypes.map((glassType) => [glassType.id, glassType.name])
  )

  const quotesById = new Map<number, (typeof pendingQuotes)[number]>(
    pendingQuotes.map((quote) => [quote.id, quote])
  )
  const now = Date.now()

  const items = shortages.map((shortage) => {
    const oldestPendingDays = Math.max(
      ...shortage.affectedQuoteIds.map((id) => {
        const quote = quotesById.get(id)
        return quote ? Math.floor((now - new Date(quote.createdAt).getTime()) / MS_PER_DAY) : 0
      })
    )

    return {
      glassTypeId: shortage.glassTypeId,
      glassTypeName: glassTypeNameById.get(shortage.glassTypeId) ?? "Unknown glass type",
      shortfallQuantity: shortage.shortfallQuantity,
      affectedQuoteCount: shortage.affectedQuoteIds.length,
      oldestPendingDays,
    }
  })

  return items.sort((a, b) => b.shortfallQuantity - a.shortfallQuantity)
}
