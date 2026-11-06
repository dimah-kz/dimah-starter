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
  AdminUserTableFilter,
  AdminUsersPageQuery,
} from "@/app/dashboard/admin/users/lib/admin-users-table-params"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { requirePlatformAdmin } from "@/app/dashboard/lib/dashboard-session"
import { roleColumnHasToken } from "@/app/dashboard/lib/role-column"
import { user } from "@repo/db/schema"
import { clampListPage, toListSearchPattern } from "@/components/list"
import { db } from "@repo/db"

export type AdminUserItem = {
  id: string
  name: string
  email: string
  image: string | null
  role: string
  banned: boolean
  createdAt: string
}

function buildUsersWhere(
  filter: AdminUserTableFilter,
  q?: string
): SQL | undefined {
  const conditions: SQL[] = []

  if (filter === "admins") {
    conditions.push(roleColumnHasToken(user.role, "admin"))
  } else if (filter === "users") {
    conditions.push(
      and(
        roleColumnHasToken(user.role, "user"),
        not(roleColumnHasToken(user.role, "admin"))
      )!
    )
  } else if (filter === "banned") {
    conditions.push(eq(user.banned, true))
  }

  const pattern = toListSearchPattern(q)
  if (pattern) {
    conditions.push(or(ilike(user.name, pattern), ilike(user.email, pattern))!)
  }

  return conditions.length ? and(...conditions) : undefined
}

/** Platform admins only — checks the caller, then reads the cached page. */
export async function getAdminUsersPage(query: AdminUsersPageQuery) {
  await requirePlatformAdmin()
  return getCachedAdminUsersPage(query)
}

async function getCachedAdminUsersPage(query: AdminUsersPageQuery) {
  "use cache"

  cacheLife("minutes")
  cacheTag(dashboardCacheTags.adminUsersPage())

  const where = buildUsersWhere(query.filter, query.q)

  const [countRow] = await db
    .select({ totalCount: count() })
    .from(user)
    .where(where)
  const totalCount = countRow?.totalCount ?? 0

  const page = clampListPage(query.page, totalCount, query.pageSize)

  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      role: user.role,
      banned: user.banned,
      createdAt: user.createdAt,
    })
    .from(user)
    .where(where)
    .orderBy(desc(user.createdAt))
    .limit(query.pageSize)
    .offset((page - 1) * query.pageSize)

  return {
    users: users.map((row): AdminUserItem => ({
      id: row.id,
      name: row.name,
      email: row.email,
      image: row.image,
      role: row.role ?? "user",
      banned: row.banned ?? false,
      createdAt: row.createdAt.toISOString(),
    })),
    totalCount,
    page,
    pageSize: query.pageSize,
    filter: query.filter,
    q: query.q,
  }
}
