import "server-only"

import { moneySchema } from "@/core/shared/money"
import {
  windowTypeSchema,
  type NewWindowType,
  type WindowType,
  type WindowTypeId,
} from "@/core/products/window-type.types"
import { paginate } from "@/lib/db/paginate"
import { getDb } from "@/lib/db/server"
import type { Database } from "@/lib/db/types"

type WindowTypeRow = Database["public"]["Tables"]["window_types"]["Row"]

function toWindowType(row: WindowTypeRow): WindowType {
  return windowTypeSchema.parse({
    id: row.id,
    name: row.name,
    laborCost: moneySchema.parse(row.labor_cost_cents),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  })
}

export const WINDOW_TYPES_PAGE_SIZE = 5

export type WindowTypesPage = {
  windowTypes: WindowType[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export async function listWindowTypes(page: number): Promise<WindowTypesPage> {
  const result = await paginate<WindowTypeRow>({
    page,
    pageSize: WINDOW_TYPES_PAGE_SIZE,
    count: () =>
      getDb().from("window_types").select("*", { count: "exact", head: true }),
    data: ({ from, to }) =>
      getDb()
        .from("window_types")
        .select()
        .order("name", { ascending: true })
        .order("id", { ascending: true })
        .range(from, to),
  })

  return {
    windowTypes: result.items.map(toWindowType),
    page: result.page,
    pageSize: result.pageSize,
    totalCount: result.totalCount,
    totalPages: result.totalPages,
  }
}

export async function listAllWindowTypes(): Promise<WindowType[]> {
  const { data, error } = await getDb()
    .from("window_types")
    .select()
    .order("name", { ascending: true })

  if (error) throw error

  return data.map(toWindowType)
}

export async function getWindowType(id: WindowTypeId): Promise<WindowType | null> {
  const { data, error } = await getDb()
    .from("window_types")
    .select()
    .eq("id", id)
    .maybeSingle()

  if (error) throw error
  if (!data) return null

  return toWindowType(data)
}

export async function insertWindowType(
  input: NewWindowType
): Promise<WindowType> {
  const { data, error } = await getDb()
    .from("window_types")
    .insert({
      name: input.name,
      labor_cost_cents: input.laborCost,
    })
    .select()
    .single()

  if (error) throw error

  return toWindowType(data)
}

export async function updateWindowType(
  windowType: WindowType
): Promise<WindowType> {
  const { data, error } = await getDb()
    .from("window_types")
    .update({
      name: windowType.name,
      labor_cost_cents: windowType.laborCost,
    })
    .eq("id", windowType.id)
    .select()
    .single()

  if (error) throw error

  return toWindowType(data)
}

export async function deleteWindowType(id: WindowTypeId): Promise<void> {
  const { error } = await getDb().from("window_types").delete().eq("id", id)

  if (error) throw error
}
