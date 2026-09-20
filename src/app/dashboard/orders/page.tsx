import { SiteHeader } from "@/components/site-header"
import { OrdersTable } from "@/features/orders/components/orders-table"
import { listOrders } from "@/features/orders/repository"

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { page: pageParam } = await searchParams
  const page = Number(Array.isArray(pageParam) ? pageParam[0] : pageParam) || 1

  const ordersPage = await listOrders(page)

  return (
    <>
      <SiteHeader title="Orders" />
      <OrdersTable ordersPage={ordersPage} />
    </>
  )
}
