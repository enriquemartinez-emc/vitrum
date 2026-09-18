import { SiteHeader } from "@/components/site-header"
import { WindowTypesTable } from "@/features/products/components/window-types-table"
import { listWindowTypes } from "@/features/products/window-types.repository"

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function WindowTypesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const page = Number(firstValue(params.page)) || 1

  const windowTypesPage = await listWindowTypes(page)

  return (
    <>
      <SiteHeader title="Window Types" />
      <WindowTypesTable windowTypesPage={windowTypesPage} />
    </>
  )
}
