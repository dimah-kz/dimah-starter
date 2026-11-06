import type { MembershipRole } from "@repo/auth/organization-access"
import { parseRoleString } from "@repo/auth/role-string"

/** Lowest to highest. */
const membershipRoleHierarchy = [
  "member",
  "admin",
  "owner",
] as const satisfies readonly MembershipRole[]

/** Known membership roles in a Better Auth role string. */
export function toMembershipRoles(role: string | null): MembershipRole[] {
  return parseRoleString(role).filter((token): token is MembershipRole =>
    (membershipRoleHierarchy as readonly string[]).includes(token)
  )
}

/** Roles the actor may grant: up to their highest role, highest first. */
export function memberRoleOptions(actorRole: string | null): MembershipRole[] {
  const highest = Math.max(
    0,
    ...toMembershipRoles(actorRole).map((role) =>
      membershipRoleHierarchy.indexOf(role)
    )
  )

  return membershipRoleHierarchy.slice(0, highest + 1).reverse()
}

/** Only an owner may change or remove another owner. */
export function canManageMember(actorRole: string | null, memberRole: string) {
  return (
    !toMembershipRoles(memberRole).includes("owner") ||
    toMembershipRoles(actorRole).includes("owner")
  )
}
