import "server-only"

import { incrementAiUsage } from "@/features/ai/usage-repository"

const DEFAULT_DAILY_LIMIT = 50

function dailyLimit(): number {
  const raw = process.env.AI_DAILY_REQUEST_LIMIT
  const parsed = raw ? Number(raw) : NaN
  return Number.isInteger(parsed) && parsed > 0 ? parsed : DEFAULT_DAILY_LIMIT
}

export async function checkAiRateLimit(feature: string): Promise<{ allowed: boolean }> {
  const today = new Date().toISOString().slice(0, 10)
  const count = await incrementAiUsage(feature, today)

  return { allowed: count <= dailyLimit() }
}
