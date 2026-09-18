import "server-only"

import type { PostgrestError } from "@supabase/supabase-js"

export type Paginated<T> = {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export async function paginate<T>({
  page,
  pageSize,
  count,
  data,
}: {
  page: number
  pageSize: number
  count: () => PromiseLike<{
    count: number | null
    error: PostgrestError | null
  }>
  data: (range: { from: number; to: number }) => PromiseLike<{
    data: T[] | null
    error: PostgrestError | null
  }>
}): Promise<Paginated<T>> {
  const { count: totalCount, error: countError } = await count()
  if (countError) throw countError

  const total = totalCount ?? 0
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(Math.max(1, Math.trunc(page) || 1), totalPages)

  const from = (currentPage - 1) * pageSize
  const to = from + pageSize - 1

  const { data: rows, error } = await data({ from, to })
  if (error) throw error

  return {
    items: rows ?? [],
    page: currentPage,
    pageSize,
    totalCount: total,
    totalPages,
  }
}
