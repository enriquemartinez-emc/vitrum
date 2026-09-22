import "server-only"

import { tool } from "ai"
import { z } from "zod"

import * as reportsRepository from "@/features/reports/repository"

const MAX_RESULTS = 20
const DEFAULT_RESULTS = 5

const dateRangeShape = {
  from: z.iso.date().describe("Start date, inclusive, as YYYY-MM-DD."),
  to: z.iso.date().describe("End date, inclusive, as YYYY-MM-DD."),
}

export const getRevenueSummaryTool = tool({
  description:
    "Total revenue, quote count, and average quote value from approved quotes " +
    "within a date range, by the date each quote was approved.",
  inputSchema: z.object(dateRangeShape),
  execute: async ({ from, to }) => reportsRepository.getRevenueSummary(from, to),
})

export const getOrderStatusSummaryTool = tool({
  description: "Counts of scheduled, overdue, and complete orders as of today.",
  inputSchema: z.object({}),
  execute: async () =>
    reportsRepository.getOrderStatusSummary(new Date().toISOString().slice(0, 10)),
})

export const getGlassTypeDemandTool = tool({
  description:
    "Top glass types by quoted quantity and total square footage within a date " +
    "range, by the date each quote was created.",
  inputSchema: z.object({
    ...dateRangeShape,
    limit: z
      .number()
      .int()
      .positive()
      .max(MAX_RESULTS)
      .optional()
      .describe(`Max results, default ${DEFAULT_RESULTS}.`),
  }),
  execute: async ({ from, to, limit }) =>
    reportsRepository.getGlassTypeDemand(from, to, limit ?? DEFAULT_RESULTS),
})

export const getQuoteConversionSummaryTool = tool({
  description:
    "Pending/approved/declined quote counts and the approval rate within a date " +
    "range, by the date each quote was created.",
  inputSchema: z.object(dateRangeShape),
  execute: async ({ from, to }) => reportsRepository.getQuoteConversionSummary(from, to),
})

export const getTopCustomersByRevenueTool = tool({
  description: "Top customers by approved-quote revenue within a date range.",
  inputSchema: z.object({
    ...dateRangeShape,
    limit: z
      .number()
      .int()
      .positive()
      .max(MAX_RESULTS)
      .optional()
      .describe(`Max results, default ${DEFAULT_RESULTS}.`),
  }),
  execute: async ({ from, to, limit }) =>
    reportsRepository.getTopCustomersByRevenue(from, to, limit ?? DEFAULT_RESULTS),
})
