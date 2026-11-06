import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"
import {
  listPath,
  parseListPage,
  parseListPageSize,
  parseListQuery,
  type ListSearchParamsInput,
} from "@/components/list"

export const ADMIN_ORGANIZATIONS_DEFAULT_PAGE_SIZE = 20

export type AdminOrganizationsPageQuery = {
  page: number
  pageSize: number
  q?: string
}

export function parseAdminOrganizationsPageQuery(
  searchParams: Record<string, string | string[] | undefined>
): AdminOrganizationsPageQuery {
  return {
    page: parseListPage(searchParams),
    pageSize: parseListPageSize(
      searchParams,
      ADMIN_ORGANIZATIONS_DEFAULT_PAGE_SIZE
    ),
    q: parseListQuery(searchParams),
  }
}

export function adminOrganizationsTablePath(
  input: ListSearchParamsInput = {}
): string {
  return listPath(
    dashboardRoutes.adminOrganizations(),
    input,
    ADMIN_ORGANIZATIONS_DEFAULT_PAGE_SIZE
  )
}
