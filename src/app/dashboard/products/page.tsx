import { SiteHeader } from "@/components/site-header"
import type { ProductsTab } from "@/features/products/build-href"
import { ProductsTabs } from "@/features/products/components/products-tabs"
import { listGlassTypes } from "@/features/products/glass-types.repository"
import { listWindowTypes } from "@/features/products/window-types.repository"

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const activeTab: ProductsTab =
    firstValue(params.tab) === "glass-types" ? "glass-types" : "window-types"
  const windowPage = Number(firstValue(params.windowPage)) || 1
  const glassPage = Number(firstValue(params.glassPage)) || 1

  const [windowTypesPage, glassTypesPage] = await Promise.all([
    listWindowTypes(windowPage),
    listGlassTypes(glassPage),
  ])

  return (
    <>
      <SiteHeader title="Products" />
      <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
        <ProductsTabs
          activeTab={activeTab}
          windowTypesPage={windowTypesPage}
          glassTypesPage={glassTypesPage}
        />
      </div>
    </>
  )
}
