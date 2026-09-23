"use server"

import { checkAiRateLimit } from "@/features/ai/rate-limit"
import { narrateShortageDigest } from "@/features/reports/ai/narration"
import { computeShortageDigest } from "@/features/reports/shortage-digest"

const AI_FEATURE = "inventory_digest"

export type NarrateShortageDigestResult =
  | { status: "ok"; summary: string }
  | { status: "error"; message: string }

// Recomputes the digest itself (cheap, no AI) rather than trusting whatever
// the client last rendered, then spends AI budget only on the narration.
export async function narrateShortageDigestAction(): Promise<NarrateShortageDigestResult> {
  try {
    const items = await computeShortageDigest()

    if (items.length === 0) {
      return {
        status: "ok",
        summary: "Nothing to reorder — every pending quote can be fulfilled from current stock.",
      }
    }

    const { allowed } = await checkAiRateLimit(AI_FEATURE)
    if (!allowed) {
      return { status: "error", message: "Daily AI usage limit reached. Try again tomorrow." }
    }

    const summary = await narrateShortageDigest(items)
    return { status: "ok", summary }
  } catch {
    return { status: "error", message: "Something went wrong. Try again in a moment." }
  }
}
