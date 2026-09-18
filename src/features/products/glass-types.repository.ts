import "server-only"

import { moneySchema } from "@/core/shared/money"
import {
  glassTypeSchema,
  type GlassType,
  type GlassTypeId,
  type NewGlassType,
} from "@/core/products/glass-type.types"
import { paginate } from "@/lib/db/paginate"
import { getDb } from "@/lib/db/server"
import type { Database } from "@/lib/db/types"

type GlassTypeRow = Database["public"]["Tables"]["glass_types"]["Row"]

function toGlassType(row: GlassTypeRow): GlassType {
  return glassTypeSchema.parse({
    id: row.id,
    name: row.name,
    pricePerSqFt: moneySchema.parse(row.price_per_sqft_cents),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })
}

export const GLASS_TYPES_PAGE_SIZE = 5

export type GlassTypesPage = {
  glassTypes: GlassType[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export async function listGlassTypes(page: number): Promise<GlassTypesPage> {
  const result = await paginate<GlassTypeRow>({
    page,
    pageSize: GLASS_TYPES_PAGE_SIZE,
    count: () =>
      getDb().from("glass_types").select("*", { count: "exact", head: true }),
    data: ({ from, to }) =>
      getDb()
        .from("glass_types")
        .select()
        .order("name", { ascending: true })
        .order("id", { ascending: true })
        .range(from, to),
  })

  return {
    glassTypes: result.items.map(toGlassType),
    page: result.page,
    pageSize: result.pageSize,
    totalCount: result.totalCount,
    totalPages: result.totalPages,
  }
}

export async function listAllGlassTypes(): Promise<GlassType[]> {
  const { data, error } = await getDb()
    .from("glass_types")
    .select()
    .order("name", { ascending: true })

  if (error) throw error

  return data.map(toGlassType)
}

export async function getGlassType(id: GlassTypeId): Promise<GlassType | null> {
  const { data, error } = await getDb()
    .from("glass_types")
    .select()
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return toGlassType(data)
}

export async function insertGlassType(input: NewGlassType): Promise<GlassType> {
  const { data, error } = await getDb()
    .from("glass_types")
    .insert({
      name: input.name,
      price_per_sqft_cents: input.pricePerSqFt,
    })
    .select()
    .single()

  if (error) throw error

  return toGlassType(data)
}

export async function updateGlassType(glassType: GlassType): Promise<GlassType> {
  const { data, error } = await getDb()
    .from("glass_types")
    .update({
      name: glassType.name,
      price_per_sqft_cents: glassType.pricePerSqFt,
    })
    .eq("id", glassType.id)
    .select()
    .single()

  if (error) throw error

  return toGlassType(data)
}

export async function deleteGlassType(id: GlassTypeId): Promise<void> {
  const { error } = await getDb().from("glass_types").delete().eq("id", id)

  if (error) throw error
}
