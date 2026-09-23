import "server-only"

import { getOrderStatusSummary } from "@/features/reports/repository"
import { computeShortageDigest } from "@/features/reports/shortage-digest"

export type DashboardMetrics = {
  scheduledOrders: number
  overdueOrders: number
  shortageCount: number
  mostUrgentShortageName: string | null
}

export async function computeDashboardMetrics(now: Date = new Date()): Promise<DashboardMetrics> {
  const today = now.toISOString().slice(0, 10)

  const [orderStatus, shortages] = await Promise.all([
    getOrderStatusSummary(today),
    computeShortageDigest(),
  ])

  return {
    scheduledOrders: orderStatus.scheduledCount,
    overdueOrders: orderStatus.overdueCount,
    shortageCount: shortages.length,
    // shortages is already sorted by shortfallQuantity descending.
    mostUrgentShortageName: shortages[0]?.glassTypeName ?? null,
  }
}
