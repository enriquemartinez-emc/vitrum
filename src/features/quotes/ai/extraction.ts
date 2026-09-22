import "server-only"

import { google } from "@ai-sdk/google"
import { generateText, isStepCount, Output } from "ai"
import { z } from "zod"

import type { Customer } from "@/core/customers/customer.types"
import type { GlassType } from "@/core/products/glass-type.types"
import type { WindowType } from "@/core/products/window-type.types"
import {
  listGlassTypesTool,
  listWindowTypesTool,
  searchCustomersTool,
} from "@/features/quotes/ai/tools"

const MAX_STEPS = 6

const quoteDraftOutputSchema = z.object({
  customerId: z
    .number()
    .int()
    .positive()
    .nullable()
    .describe(
      "The id of a customer returned by searchCustomers. Null if no confident match was found."
    ),
  customerName: z
    .string()
    .nullable()
    .describe(
      "The customer's name as understood from the request, shown when customerId is null."
    ),
  lineItems: z.array(
    z.object({
      windowTypeId: z
        .number()
        .int()
        .positive()
        .describe("Must be an id returned by listWindowTypes."),
      glassTypeId: z
        .number()
        .int()
        .positive()
        .describe("Must be an id returned by listGlassTypes."),
      widthIn: z.number().positive().describe("Width in inches."),
      heightIn: z.number().positive().describe("Height in inches."),
      quantity: z.number().int().positive(),
    })
  ),
})

export type QuoteDraftOutput = z.infer<typeof quoteDraftOutputSchema>

export async function extractQuoteDraft({
  prompt,
  customers,
  windowTypes,
  glassTypes,
}: {
  prompt: string
  customers: Customer[]
  windowTypes: WindowType[]
  glassTypes: GlassType[]
}): Promise<QuoteDraftOutput> {
  const { output } = await generateText({
    model: google("gemini-3.8-flash"),
    tools: {
      searchCustomers: searchCustomersTool,
      listWindowTypes: listWindowTypesTool,
      listGlassTypes: listGlassTypesTool,
    },
    // Tool context is genuinely per-call (a fresh catalog fetch every time),
    // so it's supplied here rather than fixed on a constructed agent instance.
    toolsContext: {
      searchCustomers: { customers },
      listWindowTypes: { windowTypes },
      listGlassTypes: { glassTypes },
    },
    stopWhen: isStepCount(MAX_STEPS),
    output: Output.object({ schema: quoteDraftOutputSchema }),
    system:
      "You extract structured window quote requests for a window shop. Always call " +
      "listWindowTypes and listGlassTypes first to see the real catalog and its ids, and " +
      "call searchCustomers if a customer name is mentioned. Only use ids that a tool " +
      "actually returned — never invent one. If a detail is missing or ambiguous, omit " +
      "that line item rather than guessing dimensions or quantities.",
    onStepEnd: ({ stepNumber, toolCalls, usage }) => {
      console.log("[quote-extraction] step", stepNumber, {
        tools: toolCalls?.map((call) => call.toolName),
        totalTokens: usage.totalTokens,
      })
    },
    prompt,
  })

  return output
}
