import "server-only"

import { google } from "@ai-sdk/google"
import { generateText } from "ai"

import type { ShortageDigestItem } from "@/features/reports/shortage-digest"

export async function narrateShortageDigest(items: ShortageDigestItem[]): Promise<string> {
  const { text } = await generateText({
    model: google("gemini-3.8-flash"),
    system:
      "You write short, actionable inventory alerts for a window shop owner. Given a list " +
      "of glass shortages — each with the glass type, how many units short, how many pending " +
      "quotes need it, and how many days the oldest affected quote has been waiting — write a " +
      "brief prioritized summary, most urgent first, telling the owner what to reorder and " +
      "why. A few sentences per item, plain language, no markdown headers.",
    prompt: JSON.stringify(items),
  })

  return text
}
