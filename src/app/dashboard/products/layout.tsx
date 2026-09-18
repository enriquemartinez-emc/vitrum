import { SiteHeader } from "@/components/site-header"
import { ProductsNav } from "@/features/products/components/products-nav"

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <SiteHeader title="Products" />
      <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
        <ProductsNav />
        {children}
      </div>
    </>
  )
}
