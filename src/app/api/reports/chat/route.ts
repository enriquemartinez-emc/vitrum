import { google } from "@ai-sdk/google"
import { convertToModelMessages, isStepCount, streamText, type UIMessage } from "ai"

import { checkAiRateLimit } from "@/features/ai/rate-limit"
import {
  getGlassTypeDemandTool,
  getOrderStatusSummaryTool,
  getQuoteConversionSummaryTool,
  getRevenueSummaryTool,
  getTopCustomersByRevenueTool,
} from "@/features/reports/ai/tools"

export const maxDuration = 30

const AI_FEATURE = "business_report"
const MAX_STEPS = 6

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const { allowed } = await checkAiRateLimit(AI_FEATURE)
  if (!allowed) {
    return new Response(
      "Daily AI usage limit reached for business reports. Try again tomorrow.",
      { status: 429 }
    )
  }

  const today = new Date().toISOString().slice(0, 10)

  const result = streamText({
    model: google("gemini-3.8-flash"),
    system:
      `You are a business reporting assistant for a window shop. Today's date is ${today}. ` +
      "Use the available tools to answer questions about revenue, orders, glass demand, " +
      "quote conversion, and top customers — never guess a number, always call a tool for it. " +
      "Resolve relative date ranges (\"last month\", \"this quarter\", \"year to date\") " +
      "yourself from today's date rather than asking the user to spell out exact dates. " +
      "Monetary values from tools are in cents — convert to dollars and format as currency " +
      "before presenting them. Be concise and lead with the number the user asked for.",
    messages: await convertToModelMessages(messages),
    tools: {
      getRevenueSummary: getRevenueSummaryTool,
      getOrderStatusSummary: getOrderStatusSummaryTool,
      getGlassTypeDemand: getGlassTypeDemandTool,
      getQuoteConversionSummary: getQuoteConversionSummaryTool,
      getTopCustomersByRevenue: getTopCustomersByRevenueTool,
    },
    stopWhen: isStepCount(MAX_STEPS),
  })

  return result.toUIMessageStreamResponse()
}
