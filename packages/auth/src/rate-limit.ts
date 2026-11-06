import { getIP } from "better-auth/api"
import { sql } from "drizzle-orm"
import { db } from "@repo/db"
import { rateLimit } from "@repo/db/schema"
import { auth } from "./auth"

/**
 * Attempts per window (seconds). Windows stay at 60s: Better Auth prunes
 * `rate_limit` rows older than its own longest window (60s), which would
 * silently shorten a longer one.
 */
const rules = {
  signIn: { window: 60, max: 5 },
  signUp: { window: 60, max: 3 },
  passwordReset: { window: 60, max: 3 },
} as const

/**
 * Counts one attempt and returns whether it is within the limit.
 *
 * Better Auth's limiter only runs for HTTP requests to `/api/auth`, so Server
 * Actions calling `auth.api` consume this one instead. The key is the client
 * IP (Better Auth's `getIP`, so `advanced.ipAddress` applies) plus `email`
 * when given. One upsert into Better Auth's `rate_limit` table keeps
 * concurrent attempts from passing on a stale read.
 */
export async function consumeRateLimit(
  rule: keyof typeof rules,
  headers: Headers,
  email?: string
) {
  const { window, max } = rules[rule]
  const ip = getIP(headers, auth.options) ?? "unknown"
  const key = [ip, `action/${rule}`, email?.toLowerCase()]
    .filter(Boolean)
    .join("|")
  const now = Date.now()
  const expired = sql`${rateLimit.lastRequest} <= ${now - window * 1000}`

  const [row] = await db
    .insert(rateLimit)
    .values({ id: crypto.randomUUID(), key, count: 1, lastRequest: now })
    .onConflictDoUpdate({
      target: rateLimit.key,
      set: {
        count: sql`case when ${expired} then 1 else ${rateLimit.count} + 1 end`,
        lastRequest: sql`case when ${expired} then ${now} else ${rateLimit.lastRequest} end`,
      },
    })
    .returning({ count: rateLimit.count })

  return (row?.count ?? 0) <= max
}
