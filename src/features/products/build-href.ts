export type ProductsTab = "window-types" | "glass-types"

export function productsHref(
  tab: ProductsTab,
  windowPage: number,
  glassPage: number
) {
  const params = new URLSearchParams()
  if (tab !== "window-types") params.set("tab", tab)
  if (windowPage > 1) params.set("windowPage", String(windowPage))
  if (glassPage > 1) params.set("glassPage", String(glassPage))

  const query = params.toString()
  return query ? `/dashboard/products?${query}` : "/dashboard/products"
}
