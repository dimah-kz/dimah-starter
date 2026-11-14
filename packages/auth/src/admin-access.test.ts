import { describe, expect, it } from "vitest"
import { adminPluginRoles, type PlatformRole } from "./admin-access"

/**
 * Platform roles. `user:list` opens `/dashboard/admin`; the users table bans
 * and changes roles. Change a role in `admin-access.ts` and update this table
 * on purpose.
 */
const expected: Record<string, Record<PlatformRole, boolean>> = {
  "user:list": { admin: true, user: false },
  "user:ban": { admin: true, user: false },
  "user:set-role": { admin: true, user: false },
}

describe.each(Object.entries(expected))("%s", (permission, roles) => {
  const [resource, action] = permission.split(":") as [string, string]

  it.each(Object.entries(roles))("%s → %s", (role, allowed) => {
    const result = adminPluginRoles[role as PlatformRole].authorize({
      [resource]: [action],
    })

    expect(result.success).toBe(allowed)
  })
})
