import { describe, expect, it } from "vitest"
import { orgRoles, type MembershipRole } from "./organization-access"

/**
 * What each organization role may do. The app gates on these permissions:
 * `member:update` opens `/dashboard/manage`, `organization:update` saves the
 * name and logo, `organization:delete` deletes the organization, and the
 * invitation actions need `invitation:*`. Change a role in
 * `organization-access.ts` and update this table on purpose.
 */
const expected: Record<string, Record<MembershipRole, boolean>> = {
  "organization:update": { owner: true, admin: true, member: false },
  "organization:delete": { owner: true, admin: false, member: false },
  "member:create": { owner: true, admin: true, member: false },
  "member:update": { owner: true, admin: true, member: false },
  "member:delete": { owner: true, admin: true, member: false },
  "invitation:create": { owner: true, admin: true, member: false },
  "invitation:cancel": { owner: true, admin: true, member: false },
}

describe.each(Object.entries(expected))("%s", (permission, roles) => {
  const [resource, action] = permission.split(":") as [string, string]

  it.each(Object.entries(roles))("%s → %s", (role, allowed) => {
    const result = orgRoles[role as MembershipRole].authorize({
      [resource]: [action],
    })

    expect(result.success).toBe(allowed)
  })
})
