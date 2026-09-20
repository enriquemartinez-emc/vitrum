import "server-only"

import {
  glassPieceSchema,
  type GlassPiece,
  type NewGlassPiece,
} from "@/core/inventory/glass-piece.types"
import type { GlassTypeId } from "@/core/products/glass-type.types"
import { paginate } from "@/lib/db/paginate"
import { getDb } from "@/lib/db/server"
import type { Database } from "@/lib/db/types"

type GlassPieceRow = Database["public"]["Tables"]["glass_pieces"]["Row"]
type GlassTypeRow = Database["public"]["Tables"]["glass_types"]["Row"]

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

export async function insertGlassPiece(input: NewGlassPiece): Promise<GlassPiece> {
  const { data, error } = await getDb()
    .from("glass_pieces")
    .insert({
      glass_type_id: input.glassTypeId,
      width_in: input.widthIn,
      height_in: input.heightIn,
      quantity: input.quantity,
      origin: input.origin,
    })
    .select()
    .single()

  if (error) throw error

  return toGlassPiece(data)
}

export const GLASS_PIECES_PAGE_SIZE = 10

export type GlassPieceSummary = GlassPiece & { glassTypeName: string }

export type GlassPiecesPage = {
  pieces: GlassPieceSummary[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

type GlassPieceListRow = GlassPieceRow & {
  glass_types: Pick<GlassTypeRow, "name"> | null
}

function toGlassPieceSummary(row: GlassPieceListRow): GlassPieceSummary {
  return {
    ...toGlassPiece(row),
    glassTypeName: row.glass_types?.name ?? "Unknown glass type",
  }
}

export async function listGlassPieces(page: number): Promise<GlassPiecesPage> {
  const result = await paginate<GlassPieceListRow>({
    page,
    pageSize: GLASS_PIECES_PAGE_SIZE,
    count: () =>
      getDb().from("glass_pieces").select("*", { count: "exact", head: true }),
    data: ({ from, to }) =>
      getDb()
        .from("glass_pieces")
        .select("*, glass_types(name)")
        .order("created_at", { ascending: false })
        .order("id", { ascending: false })
        .range(from, to),
  })

  return {
    pieces: result.items.map(toGlassPieceSummary),
    page: result.page,
    pageSize: result.pageSize,
    totalCount: result.totalCount,
    totalPages: result.totalPages,
  }
}
