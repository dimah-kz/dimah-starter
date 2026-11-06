import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"
import {
  listPath,
  parseListEnumFilter,
  parseListFilter,
  parseListPage,
  parseListPageSize,
  parseListQuery,
  type ListSearchParamsInput,
} from "@/components/list"

export const ADMIN_USERS_DEFAULT_PAGE_SIZE = 20

export const ADMIN_USER_TABLE_FILTERS = [
  "all",
  "admins",
  "users",
  "banned",
] as const

export type AdminUserTableFilter = (typeof ADMIN_USER_TABLE_FILTERS)[number]

export type AdminUsersPageQuery = {
  page: number
  pageSize: number
  filter: AdminUserTableFilter
  q?: string
}

export function parseAdminUsersPageQuery(
  searchParams: Record<string, string | string[] | undefined>
): AdminUsersPageQuery {
  return {
    page: parseListPage(searchParams),
    pageSize: parseListPageSize(searchParams, ADMIN_USERS_DEFAULT_PAGE_SIZE),
    filter: parseListEnumFilter(
      parseListFilter(searchParams),
      ADMIN_USER_TABLE_FILTERS,
      "all"
    ),
    q: parseListQuery(searchParams),
  }
}

export function adminUsersTablePath(
  input: ListSearchParamsInput & { filter?: AdminUserTableFilter } = {}
): string {
  return listPath(
    dashboardRoutes.adminUsers(),
    input,
    ADMIN_USERS_DEFAULT_PAGE_SIZE
  )
}
