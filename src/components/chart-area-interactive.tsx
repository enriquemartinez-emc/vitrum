"use client"

import * as React from "react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import { useIsMobile } from "@/hooks/use-mobile"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group"
import { formatMoney, moneySchema } from "@/core/shared/money"
import type { GlassTypeSaleByDay } from "@/features/reports/repository"

export const description = "Glass sales by type, over time"

// Fixed hue order, validated for CVD-safe adjacent pairs — see the dataviz
// skill's references/palette.md. Never cycled past 8; a 9th+ glass type
// folds into "Other" rather than generating another hue.
const CATEGORICAL_COLORS = [
  "var(--chart-categorical-1)",
  "var(--chart-categorical-2)",
  "var(--chart-categorical-3)",
  "var(--chart-categorical-4)",
  "var(--chart-categorical-5)",
  "var(--chart-categorical-6)",
  "var(--chart-categorical-7)",
  "var(--chart-categorical-8)",
]
const OTHER_LABEL = "Other"

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "")
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function ChartAreaInteractive({ sales }: { sales: GlassTypeSaleByDay[] }) {
  const isMobile = useIsMobile()
  const [timeRange, setTimeRange] = React.useState("90d")

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange("7d")
    }
  }, [isMobile])

  // Rank glass types by total revenue across the whole fetched range, so the
  // leading (most legible) categorical slots go to whichever types actually
  // sell the most — not an arbitrary or alphabetical order.
  const totalsByType = new Map<string, number>()
  for (const row of sales) {
    totalsByType.set(row.glassTypeName, (totalsByType.get(row.glassTypeName) ?? 0) + row.totalCents)
  }
  const rankedNames = Array.from(totalsByType.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([name]) => name)

  const leadingNames = rankedNames.slice(0, CATEGORICAL_COLORS.length - 1)
  const hasOther = rankedNames.length > leadingNames.length
  const seriesNames = hasOther ? [...leadingNames, OTHER_LABEL] : leadingNames

  const series = seriesNames.map((name, index) => ({
    name,
    slug: slugify(name),
    color: CATEGORICAL_COLORS[index],
  }))
  const otherOriginalNames = hasOther ? new Set(rankedNames.slice(leadingNames.length)) : null

  const chartConfig: ChartConfig = Object.fromEntries(
    series.map(({ name, slug, color }) => [slug, { label: name, color }])
  )

  // Backfill every day in the fetched range with 0 for any type that made
  // no sales that day, so the stacked area reads as "no sales" rather than
  // a gap in the data.
  const byDateAndType = new Map<string, Map<string, number>>()
  for (const row of sales) {
    const byType = byDateAndType.get(row.saleDate) ?? new Map<string, number>()
    const type = otherOriginalNames?.has(row.glassTypeName) ? OTHER_LABEL : row.glassTypeName
    byType.set(type, (byType.get(type) ?? 0) + row.totalCents)
    byDateAndType.set(row.saleDate, byType)
  }

  const today = new Date()
  const fullChartData: Record<string, string | number>[] = []
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateKey = toDateKey(date)
    const byType = byDateAndType.get(dateKey)

    const row: Record<string, string | number> = { date: dateKey }
    for (const { name, slug } of series) {
      row[slug] = (byType?.get(name) ?? 0) / 100
    }
    fullChartData.push(row)
  }

  const filteredData = fullChartData.filter((item) => {
    const date = new Date(item.date)
    let daysToSubtract = 90
    if (timeRange === "30d") {
      daysToSubtract = 30
    } else if (timeRange === "7d") {
      daysToSubtract = 7
    }
    const startDate = new Date(today)
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="@container/card">
      <CardHeader>
        <CardTitle>Glass sales by type</CardTitle>
        <CardDescription>
          <span className="hidden @[540px]/card:block">
            Revenue from approved quotes, by glass type
          </span>
          <span className="@[540px]/card:hidden">By glass type</span>
        </CardDescription>
        <CardAction>
          <ToggleGroup
            multiple={false}
            value={timeRange ? [timeRange] : []}
            onValueChange={(value) => {
              setTimeRange(value[0] ?? "90d")
            }}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">Last 3 months</ToggleGroupItem>
            <ToggleGroupItem value="30d">Last 30 days</ToggleGroupItem>
            <ToggleGroupItem value="7d">Last 7 days</ToggleGroupItem>
          </ToggleGroup>
          <Select
            value={timeRange}
            onValueChange={(value) => {
              if (value !== null) {
                setTimeRange(value)
              }
            }}
          >
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="Select a value"
            >
              <SelectValue placeholder="Last 3 months" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                Last 3 months
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                Last 30 days
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                Last 7 days
              </SelectItem>
            </SelectContent>
          </Select>
        </CardAction>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              {series.map(({ slug }) => (
                <linearGradient key={slug} id={`fill-${slug}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={`var(--color-${slug})`} stopOpacity={0.8} />
                  <stop offset="95%" stopColor={`var(--color-${slug})`} stopOpacity={0.1} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  }}
                  formatter={(value, name) => [
                    formatMoney(moneySchema.parse(Math.round(Number(value) * 100))),
                    ` ${chartConfig[name as string]?.label ?? name}`,
                  ]}
                  indicator="dot"
                />
              }
            />
            {[...series].reverse().map(({ slug, color }) => (
              <Area
                key={slug}
                dataKey={slug}
                type="natural"
                fill={`url(#fill-${slug})`}
                stroke={color}
                stackId="a"
              />
            ))}
          </AreaChart>
        </ChartContainer>
        {/* Rendered as plain HTML below the chart, not Recharts' in-SVG
            Legend — with 6 categories the legend wraps to multiple lines,
            and an in-SVG legend doesn't reserve space for the extra
            line(s), so it overlaps the plot instead of pushing it up. */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 pt-3 text-xs text-muted-foreground">
          {series.map(({ name, slug, color }) => (
            <div key={slug} className="flex items-center gap-1.5">
              <div className="size-2 shrink-0 rounded-[2px]" style={{ backgroundColor: color }} />
              {name}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
