import { and, eq, inArray, ne } from "drizzle-orm"
import { db } from "@repo/db"
import { member, organization } from "@repo/db/schema"
import { parseRoleString } from "./role-string"

const OWNER_ROLE = "owner"

/**
 * Organizations that would have no owner left without `userId`. Deleting the
 * user cascades their memberships, so these would stay behind unmanaged.
 */
export async function listSoleOwnedOrganizations(userId: string) {
  const owned = (
    await db
      .select({
        id: organization.id,
        name: organization.name,
        role: member.role,
      })
      .from(member)
      .innerJoin(organization, eq(member.organizationId, organization.id))
      .where(eq(member.userId, userId))
  ).filter(({ role }) => parseRoleString(role).includes(OWNER_ROLE))

  if (!owned.length) {
    return []
  }

  const otherOwners = await db
    .select({ organizationId: member.organizationId, role: member.role })
    .from(member)
    .where(
      and(
        inArray(
          member.organizationId,
          owned.map(({ id }) => id)
        ),
        ne(member.userId, userId)
      )
    )
  const coOwned = new Set(
    otherOwners
      .filter(({ role }) => parseRoleString(role).includes(OWNER_ROLE))
      .map(({ organizationId }) => organizationId)
  )

  return owned
    .filter(({ id }) => !coOwned.has(id))
    .map(({ id, name }) => ({ id, name }))
}
