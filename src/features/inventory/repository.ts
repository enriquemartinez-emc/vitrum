import "server-only"

import {
  glassPieceSchema,
  type GlassPiece,
} from "@/core/inventory/glass-piece.types"
import type { GlassTypeId } from "@/core/products/glass-type.types"
import { getDb } from "@/lib/db/server"
import type { Database } from "@/lib/db/types"

type GlassPieceRow = Database["public"]["Tables"]["glass_pieces"]["Row"]

function toGlassPiece(row: GlassPieceRow): GlassPiece {
  return glassPieceSchema.parse({
    id: row.id,
    glassTypeId: row.glass_type_id,
    widthIn: row.width_in,
    heightIn: row.height_in,
    quantity: row.quantity,
    origin: row.origin,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })
}

export async function listGlassPiecesByType(
  glassTypeId: GlassTypeId
): Promise<GlassPiece[]> {
  const { data, error } = await getDb()
    .from("glass_pieces")
    .select()
    .eq("glass_type_id", glassTypeId)

  if (error) throw error

  return data.map(toGlassPiece)
}
