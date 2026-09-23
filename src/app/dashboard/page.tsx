import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import { getGlassTypeSalesByDay } from "@/features/reports/repository"

import data from "./data.json"

export default async function Page() {
  const today = new Date().toISOString().slice(0, 10)
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

  const sales = await getGlassTypeSalesByDay(ninetyDaysAgo.toISOString().slice(0, 10), today)

  return (
    <>
      <SiteHeader title="Dashboard" />
      <div className="flex flex-1 flex-col">
        <div className="@container/main flex flex-1 flex-col gap-2">
          <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <SectionCards />
            <div className="px-4 lg:px-6">
              <ChartAreaInteractive sales={sales} />
            </div>
            <DataTable data={data} />
          </div>
        </div>
      </div>
    </>
  )
}
