import { getIP } from "better-auth/api"
import { sql } from "drizzle-orm"
import { db } from "@repo/db"
import { rateLimit } from "@repo/db/schema"
import { auth } from "./auth"

type Bucket = { by: "ip" | "email" | "ip+email"; max: number }

/**
 * Attempts per 60-second window. A rule passes only when every bucket does.
 * Windows stay at 60s: Better Auth prunes `rate_limit` rows older than its own
 * longest window (60s), which would silently shorten a longer one.
 */
const window = 60

const rules = {
  // One account's password, then many accounts from one address.
  signIn: [
    { by: "ip+email", max: 5 },
    { by: "ip", max: 30 },
  ],
  signUp: [{ by: "ip", max: 3 }],
  // Mail to one inbox stays capped when the requests come from many addresses.
  passwordReset: [
    { by: "ip+email", max: 3 },
    { by: "email", max: 5 },
  ],
  // Each call stores an OAuth state row.
  socialSignIn: [{ by: "ip", max: 10 }],
} as const satisfies Record<string, readonly Bucket[]>

/**
 * Counts one attempt in each bucket of `rule` and returns whether all of them
 * are within their limit.
 *
 * Better Auth's limiter only runs for HTTP requests to `/api/auth`, so Server
 * Actions calling `auth.api` consume this one instead. The IP is Better Auth's
 * `getIP`, so `advanced.ipAddress` applies. One upsert per bucket into Better
 * Auth's `rate_limit` table keeps concurrent attempts from passing on a stale
 * read.
 */
export async function consumeRateLimit(
  rule: keyof typeof rules,
  headers: Headers,
  email?: string
) {
  const ip = getIP(headers, auth.options) ?? "unknown"
  const address = email?.trim().toLowerCase() ?? ""
  const now = Date.now()

  const results = await Promise.all(
    rules[rule].map(({ by, max }) => {
      const subject =
        by === "ip" ? ip : by === "email" ? address : `${ip}|${address}`
      return consume(`action/${rule}/${by}|${subject}`, max, now)
    })
  )

  return results.every(Boolean)
}

async function consume(key: string, max: number, now: number) {
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
