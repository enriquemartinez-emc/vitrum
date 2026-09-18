"use client"

import { useRouter } from "next/navigation"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { productsHref, type ProductsTab } from "@/features/products/build-href"
import { GlassTypesTable } from "@/features/products/components/glass-types-table"
import { WindowTypesTable } from "@/features/products/components/window-types-table"
import type { GlassTypesPage } from "@/features/products/glass-types.repository"
import type { WindowTypesPage } from "@/features/products/window-types.repository"

export function ProductsTabs({
  activeTab,
  windowTypesPage,
  glassTypesPage,
}: {
  activeTab: ProductsTab
  windowTypesPage: WindowTypesPage
  glassTypesPage: GlassTypesPage
}) {
  const router = useRouter()

  return (
    <Tabs
      value={activeTab}
      onValueChange={(value) => {
        router.push(
          productsHref(
            value as ProductsTab,
            windowTypesPage.page,
            glassTypesPage.page
          )
        )
      }}
      className="flex flex-col gap-4"
    >
      <TabsList>
        <TabsTrigger value="window-types">Window Types</TabsTrigger>
        <TabsTrigger value="glass-types">Glass Types</TabsTrigger>
      </TabsList>
      <TabsContent value="window-types">
        <WindowTypesTable
          windowTypesPage={windowTypesPage}
          glassPage={glassTypesPage.page}
        />
      </TabsContent>
      <TabsContent value="glass-types">
        <GlassTypesTable
          glassTypesPage={glassTypesPage}
          windowPage={windowTypesPage.page}
        />
      </TabsContent>
    </Tabs>
  )
}
