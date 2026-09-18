import "server-only"

import { createClient, type SupabaseClient } from "@supabase/supabase-js"

import type { Database } from "@/lib/db/types"

let client: SupabaseClient<Database> | undefined

/**
 * Privileged client — full data access, bypasses RLS. Every `repository.ts`
 * uses this. Never import it from client components or expose its key to
 * the browser.
 */
export function getDb() {
  if (!client) {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SECRET_KEY

    if (!url || !key) {
      throw new Error(
        "Missing SUPABASE_URL or SUPABASE_SECRET_KEY environment variables"
      )
    }

    client = createClient<Database>(url, key, {
      auth: { persistSession: false },
    })
  }

  return client
}
