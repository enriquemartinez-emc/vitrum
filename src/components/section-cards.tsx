import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { DashboardMetrics } from "@/features/reports/dashboard-metrics"

export function SectionCards({ metrics }: { metrics: DashboardMetrics }) {
  return (
    <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 dark:*:data-[slot=card]:bg-card">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Pending orders</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.scheduledOrders}
          </CardTitle>
          <CardAction>
            {metrics.overdueOrders > 0 ? (
              <Badge variant="destructive">{metrics.overdueOrders} overdue</Badge>
            ) : (
              <Badge variant="outline">On track</Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">Scheduled, not yet installed</div>
          <div className="text-muted-foreground">
            {metrics.overdueOrders > 0
              ? "Past their installation date"
              : "None past their installation date"}
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Inventory shortages</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {metrics.shortageCount}
          </CardTitle>
          <CardAction>
            {metrics.shortageCount > 0 ? (
              <Badge variant="destructive">Reorder needed</Badge>
            ) : (
              <Badge variant="outline">All stocked</Badge>
            )}
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Glass types short for pending quotes
          </div>
          <div className="text-muted-foreground">
            {metrics.mostUrgentShortageName
              ? `Most urgent: ${metrics.mostUrgentShortageName}`
              : "Every pending quote can be fulfilled"}
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
