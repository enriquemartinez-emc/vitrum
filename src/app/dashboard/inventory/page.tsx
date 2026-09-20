import { SiteHeader } from "@/components/site-header"
import { InventoryTable } from "@/features/inventory/components/inventory-table"
import { listGlassPieces } from "@/features/inventory/repository"
import { listAllGlassTypes } from "@/features/products/glass-types.repository"

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { page: pageParam } = await searchParams
  const page = Number(Array.isArray(pageParam) ? pageParam[0] : pageParam) || 1

  const [piecesPage, glassTypes] = await Promise.all([
    listGlassPieces(page),
    listAllGlassTypes(),
  ])

  return (
    <>
      <SiteHeader title="Inventory" />
      <InventoryTable piecesPage={piecesPage} glassTypes={glassTypes} />
    </>
  )
}
