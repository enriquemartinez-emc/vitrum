import { SiteHeader } from "@/components/site-header"
import { GlassTypesTable } from "@/features/products/components/glass-types-table"
import { listGlassTypes } from "@/features/products/glass-types.repository"

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function GlassTypesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const page = Number(firstValue(params.page)) || 1

  const glassTypesPage = await listGlassTypes(page)

  return (
    <>
      <SiteHeader title="Glass Types" />
      <GlassTypesTable glassTypesPage={glassTypesPage} />
    </>
  )
}
