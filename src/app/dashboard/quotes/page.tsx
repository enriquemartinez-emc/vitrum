import { SiteHeader } from "@/components/site-header"
import { listAllCustomers } from "@/features/customers/repository"
import { listAllGlassTypes } from "@/features/products/glass-types.repository"
import { listAllWindowTypes } from "@/features/products/window-types.repository"
import { QuotesTable } from "@/features/quotes/components/quotes-table"
import { listQuotes } from "@/features/quotes/repository"

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { page: pageParam } = await searchParams
  const page = Number(Array.isArray(pageParam) ? pageParam[0] : pageParam) || 1

  const [quotesPage, customers, windowTypes, glassTypes] = await Promise.all([
    listQuotes(page),
    listAllCustomers(),
    listAllWindowTypes(),
    listAllGlassTypes(),
  ])

  return (
    <>
      <SiteHeader title="Quotes" />
      <QuotesTable
        quotesPage={quotesPage}
        customers={customers}
        windowTypes={windowTypes}
        glassTypes={glassTypes}
      />
    </>
  )
}
