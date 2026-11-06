import { eq, like, or, type SQL } from "@repo/db/drizzle"
import type { member, user } from "@repo/db/schema"

/** Better Auth stores roles comma-separated; true when `column` lists `role`. */
export function roleColumnHasToken(
  column: typeof user.role | typeof member.role,
  role: string
): SQL {
  return or(
    eq(column, role),
    like(column, `${role},%`),
    like(column, `%,${role}`),
    like(column, `%,${role},%`)
  )!
}
