import { cacheLife, cacheTag } from "next/cache"
import {
  and,
  count,
  desc,
  eq,
  ilike,
  not,
  or,
  type SQL,
} from "@repo/db/drizzle"
import type {
  MemberTableFilter,
  OrganizationMembersPageQuery,
} from "@/app/dashboard/(organization)/manage/members/lib/members-table-params"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { requireOrganizationManager } from "@/app/dashboard/lib/dashboard-session"
import { roleColumnHasToken } from "@/app/dashboard/lib/role-column"
import { member, user } from "@repo/db/schema"
import { clampListPage, toListSearchPattern } from "@/components/list"
import { db } from "@repo/db"

export type OrganizationMemberItem = {
  id: string
  userId: string
  name: string
  email: string
  image: string | null
  role: string
  joinedAt: string
}

function buildMembersWhere(
  organizationId: string,
  filter: MemberTableFilter,
  q?: string
): SQL {
  const conditions: SQL[] = [eq(member.organizationId, organizationId)]

  if (filter === "managers") {
    conditions.push(
      or(
        roleColumnHasToken(member.role, "owner"),
        roleColumnHasToken(member.role, "admin")
      )!
    )
  } else if (filter === "members") {
    conditions.push(
      and(
        roleColumnHasToken(member.role, "member"),
        not(roleColumnHasToken(member.role, "owner")),
        not(roleColumnHasToken(member.role, "admin"))
      )!
    )
  }

  const pattern = toListSearchPattern(q)
  if (pattern) {
    conditions.push(or(ilike(user.name, pattern), ilike(user.email, pattern))!)
  }

  return and(...conditions)!
}

/** Members of the active organization, for its managers only. */
export async function getOrganizationMembersPage(
  query: OrganizationMembersPageQuery
) {
  const { organizationId } = await requireOrganizationManager()
  return getCachedOrganizationMembersPage(organizationId, query)
}

async function getCachedOrganizationMembersPage(
  organizationId: string,
  query: OrganizationMembersPageQuery
) {
  "use cache"

  cacheLife("minutes")
  cacheTag(dashboardCacheTags.organizationMembersById(organizationId))

  const where = buildMembersWhere(organizationId, query.filter, query.q)

  const [countRow] = await db
    .select({ totalCount: count() })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(where)
  const totalCount = countRow?.totalCount ?? 0

  const page = clampListPage(query.page, totalCount, query.pageSize)

  const members = await db
    .select({
      id: member.id,
      userId: member.userId,
      name: user.name,
      email: user.email,
      image: user.image,
      role: member.role,
      createdAt: member.createdAt,
    })
    .from(member)
    .innerJoin(user, eq(member.userId, user.id))
    .where(where)
    .orderBy(desc(member.createdAt))
    .limit(query.pageSize)
    .offset((page - 1) * query.pageSize)

  return {
    members: members.map((row): OrganizationMemberItem => ({
      id: row.id,
      userId: row.userId,
      name: row.name,
      email: row.email,
      image: row.image,
      role: row.role,
      joinedAt: row.createdAt.toISOString(),
    })),
    totalCount,
    page,
    pageSize: query.pageSize,
    filter: query.filter,
    q: query.q,
  }
}
