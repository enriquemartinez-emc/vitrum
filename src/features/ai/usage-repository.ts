import "server-only"

import { getDb } from "@/lib/db/server"

export async function incrementAiUsage(feature: string, day: string): Promise<number> {
  const { data, error } = await getDb().rpc("increment_ai_usage_counter", {
    p_feature: feature,
    p_day: day,
  })

  if (error) throw error

  return data
}
