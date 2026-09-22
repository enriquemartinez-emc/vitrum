"use server"

import { z } from "zod"

import { resolveQuoteDraft } from "@/core/quotes/quote.rules"
import type { QuoteDraftLineItem } from "@/core/quotes/quote.types"
import { checkAiRateLimit } from "@/features/ai/rate-limit"
import * as customersRepository from "@/features/customers/repository"
import * as glassTypesRepository from "@/features/products/glass-types.repository"
import * as windowTypesRepository from "@/features/products/window-types.repository"
import { extractQuoteDraft } from "@/features/quotes/ai/extraction"

const AI_FEATURE = "quote_extraction"

const promptSchema = z.string().trim().min(3).max(2000)

export type QuoteDraft = {
  matchedCustomerId: number | null
  extractedCustomerName: string | null
  lineItems: QuoteDraftLineItem[]
}

export type ExtractQuoteDraftResult =
  | ({ status: "ok" } & QuoteDraft)
  | { status: "error"; message: string }

export async function extractQuoteDraftAction(
  rawPrompt: string
): Promise<ExtractQuoteDraftResult> {
  const parsedPrompt = promptSchema.safeParse(rawPrompt)
  if (!parsedPrompt.success) {
    return { status: "error", message: "Describe at least one window to quote." }
  }

  try {
    // Checked first so a burst of requests after the cap is hit fails on one
    // cheap counter increment instead of three catalog reads each time.
    const { allowed } = await checkAiRateLimit(AI_FEATURE)
    if (!allowed) {
      return {
        status: "error",
        message:
          "Daily AI usage limit reached. Add the line items manually, or try again tomorrow.",
      }
    }

    const [customers, windowTypes, glassTypes] = await Promise.all([
      customersRepository.listAllCustomers(),
      windowTypesRepository.listAllWindowTypes(),
      glassTypesRepository.listAllGlassTypes(),
    ])

    if (windowTypes.length === 0 || glassTypes.length === 0) {
      return {
        status: "error",
        message: "Add at least one window type and glass type before using the assistant.",
      }
    }

    let draft
    try {
      draft = await extractQuoteDraft({
        prompt: parsedPrompt.data,
        customers,
        windowTypes,
        glassTypes,
      })
    } catch {
      return {
        status: "error",
        message: "Couldn't read that request. Try rephrasing or add the line items manually.",
      }
    }

    // The model resolved these ids itself via tool calls, but a structured-output
    // schema only guarantees the *type* (a positive integer) — not that the id is
    // real. resolveQuoteDraft re-checks every id against the catalog before trusting it.
    const resolved = resolveQuoteDraft(
      { customerId: draft.customerId, lineItems: draft.lineItems },
      { customers, windowTypes, glassTypes }
    )

    if (resolved.lineItems.length === 0) {
      return {
        status: "error",
        message: "Couldn't match that to any window or glass type. Try being more specific.",
      }
    }

    return {
      status: "ok",
      matchedCustomerId: resolved.matchedCustomerId,
      extractedCustomerName: draft.customerName,
      lineItems: resolved.lineItems,
    }
  } catch {
    return { status: "error", message: "Something went wrong. Try again in a moment." }
  }
}
