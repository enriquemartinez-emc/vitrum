import { SiteHeader } from "@/components/site-header"
import { CustomersTable } from "@/features/customers/components/customers-table"
import { listCustomers } from "@/features/customers/repository"

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { page: pageParam } = await searchParams
  const page = Number(Array.isArray(pageParam) ? pageParam[0] : pageParam) || 1

  const customersPage = await listCustomers(page)

  return (
    <>
      <SiteHeader title="Customers" />
      <CustomersTable customersPage={customersPage} />
    </>
  )
}
