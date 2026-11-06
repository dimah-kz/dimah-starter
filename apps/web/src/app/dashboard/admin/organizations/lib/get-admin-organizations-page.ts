import { cacheLife, cacheTag } from "next/cache"
import { count, desc, eq, ilike, or } from "@repo/db/drizzle"
import type { AdminOrganizationsPageQuery } from "@/app/dashboard/admin/organizations/lib/admin-organizations-table-params"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { requirePlatformAdmin } from "@/app/dashboard/lib/dashboard-session"
import { member, organization } from "@repo/db/schema"
import { clampListPage, toListSearchPattern } from "@/components/list"
import { db } from "@repo/db"

export type AdminOrganizationItem = {
  id: string
  name: string
  slug: string
  logo: string | null
  memberCount: number
  createdAt: string
}

/** Platform admins only — checks the caller, then reads the cached page. */
export async function getAdminOrganizationsPage(
  query: AdminOrganizationsPageQuery
) {
  await requirePlatformAdmin()
  return getCachedAdminOrganizationsPage(query)
}

async function getCachedAdminOrganizationsPage(
  query: AdminOrganizationsPageQuery
) {
  "use cache"

  cacheLife("minutes")
  cacheTag(dashboardCacheTags.adminOrganizationsPage())

  const pattern = toListSearchPattern(query.q)
  const where = pattern
    ? or(ilike(organization.name, pattern), ilike(organization.slug, pattern))
    : undefined

  const [countRow] = await db
    .select({ totalCount: count() })
    .from(organization)
    .where(where)
  const totalCount = countRow?.totalCount ?? 0

  const page = clampListPage(query.page, totalCount, query.pageSize)

  const organizations = await db
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
      createdAt: organization.createdAt,
      memberCount: count(member.id),
    })
    .from(organization)
    .leftJoin(member, eq(member.organizationId, organization.id))
    .where(where)
    .groupBy(
      organization.id,
      organization.name,
      organization.slug,
      organization.logo,
      organization.createdAt
    )
    .orderBy(desc(organization.createdAt))
    .limit(query.pageSize)
    .offset((page - 1) * query.pageSize)

  return {
    organizations: organizations.map((row): AdminOrganizationItem => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      logo: row.logo,
      memberCount: row.memberCount,
      createdAt: row.createdAt.toISOString(),
    })),
    totalCount,
    page,
    pageSize: query.pageSize,
    q: query.q,
  }
}
