import { orgRoles, type MembershipRole } from "@repo/auth/organization-access"
import { parseRoleString } from "@repo/auth/role-string"

const membershipRoleHierarchy = [
  "member",
  "admin",
  "owner",
] as const satisfies readonly MembershipRole[]

export function memberRoleOptions(actorRole: string | null): string[] {
  const actorTokens = parseRoleString(actorRole)
  let actorMaxRank = 0

  for (const token of actorTokens) {
    if (!(token in orgRoles)) {
      continue
    }

    const rank = membershipRoleHierarchy.indexOf(token as MembershipRole) + 1
    if (rank > actorMaxRank) {
      actorMaxRank = rank
    }
  }

  if (actorMaxRank === 0) {
    return ["member"]
  }

  return membershipRoleHierarchy
    .filter((role) => membershipRoleHierarchy.indexOf(role) + 1 <= actorMaxRank)
    .slice()
    .reverse()
}
