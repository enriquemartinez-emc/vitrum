import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DashboardPendingOrders } from "@/components/dashboard-pending-orders"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { listPendingOrders } from "@/features/orders/repository"
import { computeDashboardMetrics } from "@/features/reports/dashboard-metrics"
import { getGlassTypeSalesByDay } from "@/features/reports/repository"

const PENDING_ORDERS_LIMIT = 8

export default async function Page() {
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const [sales, pendingOrders, metrics] = await Promise.all([
    getGlassTypeSalesByDay(ninetyDaysAgo.toISOString().slice(0, 10), today),
    listPendingOrders(PENDING_ORDERS_LIMIT),
    computeDashboardMetrics(now),
  ])

  return (
    <>
      <SiteHeader title="Dashboard" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards metrics={metrics} />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive sales={sales} />
            </div>
            <DashboardPendingOrders orders={pendingOrders} />
          </div>
        </div>
      </div>
    </>
  )
}
