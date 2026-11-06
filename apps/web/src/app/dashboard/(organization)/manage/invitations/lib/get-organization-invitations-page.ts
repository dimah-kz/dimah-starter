import { cacheLife, cacheTag } from "next/cache"
import { and, count, desc, eq, ilike, type SQL } from "@repo/db/drizzle"
import { db } from "@repo/db"
import { invitation } from "@repo/db/schema"
import type {
  InvitationTableFilter,
  OrganizationInvitationsPageQuery,
} from "@/app/dashboard/(organization)/manage/invitations/lib/invitations-table-params"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { requireOrganizationManager } from "@/app/dashboard/lib/dashboard-session"
import { clampListPage, toListSearchPattern } from "@/components/list"

export type OrganizationInvitationItem = {
  id: string
  email: string
  role: string
  status: string
  expiresAt: string
}

function buildInvitationsWhere(
  organizationId: string,
  filter: InvitationTableFilter,
  q?: string
): SQL {
  const conditions: SQL[] = [eq(invitation.organizationId, organizationId)]

  if (filter !== "all") {
    conditions.push(eq(invitation.status, filter))
  }

  const pattern = toListSearchPattern(q)
  if (pattern) {
    conditions.push(ilike(invitation.email, pattern))
  }

  return and(...conditions)!
}

/** Invitations of the active organization, for its managers only. */
export async function getOrganizationInvitationsPage(
  query: OrganizationInvitationsPageQuery
) {
  const { organizationId } = await requireOrganizationManager()
  return getCachedOrganizationInvitationsPage(organizationId, query)
}

async function getCachedOrganizationInvitationsPage(
  organizationId: string,
  query: OrganizationInvitationsPageQuery
) {
  "use cache"

  cacheLife("minutes")
  cacheTag(dashboardCacheTags.organizationInvitationsById(organizationId))

  const where = buildInvitationsWhere(organizationId, query.filter, query.q)

  const [countRow] = await db
    .select({ totalCount: count() })
    .from(invitation)
    .where(where)
  const totalCount = countRow?.totalCount ?? 0

  const page = clampListPage(query.page, totalCount, query.pageSize)

  const invitations = await db
    .select({
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
    })
    .from(invitation)
    .where(where)
    .orderBy(desc(invitation.createdAt))
    .limit(query.pageSize)
    .offset((page - 1) * query.pageSize)

  return {
    invitations: invitations.map((row): OrganizationInvitationItem => ({
      id: row.id,
      email: row.email,
      role: row.role ?? "member",
      status: row.status,
      expiresAt: row.expiresAt.toISOString(),
    })),
    totalCount,
    page,
    pageSize: query.pageSize,
    filter: query.filter,
    q: query.q,
  }
}
