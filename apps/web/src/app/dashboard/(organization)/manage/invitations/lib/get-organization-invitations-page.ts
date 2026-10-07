import { cacheLife, cacheTag } from "next/cache"
import { and, count, desc, eq, ilike, type SQL } from "@repo/db/drizzle"
import { db } from "@repo/db"
import { invitation } from "@repo/db/schema"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import {
  INVITATIONS_DEFAULT_PAGE_SIZE,
  parseInvitationTableFilter,
  type InvitationTableFilter,
} from "@/app/dashboard/(organization)/manage/invitations/lib/invitations-table-params"
import {
  LIST_SEARCH_MIN_LENGTH,
  clampListPage,
  parseListFilter,
  parseListPage,
  parseListPageSize,
  parseListQuery,
} from "@/components/list"

export type OrganizationInvitationItem = {
  id: string
  email: string
  role: string
  status: string
  expiresAt: string
}

export type OrganizationInvitationsPageQuery = {
  page: number
  pageSize: number
  filter: InvitationTableFilter
  q?: string
}

export type OrganizationInvitationsPageResult = {
  invitations: OrganizationInvitationItem[]
  totalCount: number
  page: number
  pageSize: number
  filter: InvitationTableFilter
  q?: string
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

  if (q && q.length >= LIST_SEARCH_MIN_LENGTH) {
    conditions.push(ilike(invitation.email, `%${q}%`))
  }

  return and(...conditions)!
}

export function parseOrganizationInvitationsPageQuery(
  searchParams: Record<string, string | string[] | undefined>
): OrganizationInvitationsPageQuery {
  return {
    page: parseListPage(searchParams),
    pageSize: parseListPageSize(searchParams, {
      defaultPageSize: INVITATIONS_DEFAULT_PAGE_SIZE,
    }),
    filter: parseInvitationTableFilter(parseListFilter(searchParams)),
    q: parseListQuery(searchParams),
  }
}

async function loadOrganizationInvitationsPage(
  organizationId: string,
  query: OrganizationInvitationsPageQuery
): Promise<OrganizationInvitationsPageResult> {
  const where = buildInvitationsWhere(organizationId, query.filter, query.q)

  const [countRow] = await db
    .select({ totalCount: count() })
    .from(invitation)
    .where(where)
  const totalCount = countRow?.totalCount ?? 0
  const page = clampListPage(query.page, totalCount, query.pageSize)
  const skip = (page - 1) * query.pageSize

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
    .offset(skip)

  return {
    invitations: invitations.map((row) => ({
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

export async function getOrganizationInvitationsPage(
  organizationId: string,
  query: OrganizationInvitationsPageQuery
) {
  "use cache"

  cacheLife("minutes")
  cacheTag(dashboardCacheTags.organizationInvitationsById(organizationId))

  return loadOrganizationInvitationsPage(organizationId, query)
}
