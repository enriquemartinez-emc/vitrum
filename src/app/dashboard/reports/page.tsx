import { SiteHeader } from "@/components/site-header"
import { BusinessReportChat } from "@/features/reports/components/business-report-chat"

export default function ReportsPage() {
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SiteHeader title="Business Reports" />
      <BusinessReportChat />
    </div>
  )
}
