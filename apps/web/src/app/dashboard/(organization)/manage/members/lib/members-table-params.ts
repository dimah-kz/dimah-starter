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

export const MEMBERS_DEFAULT_PAGE_SIZE = 20

export const MEMBER_TABLE_FILTERS = ["all", "managers", "members"] as const

export type MemberTableFilter = (typeof MEMBER_TABLE_FILTERS)[number]

export type OrganizationMembersPageQuery = {
  page: number
  pageSize: number
  filter: MemberTableFilter
  q?: string
}

export function parseOrganizationMembersPageQuery(
  searchParams: Record<string, string | string[] | undefined>
): OrganizationMembersPageQuery {
  return {
    page: parseListPage(searchParams),
    pageSize: parseListPageSize(searchParams, MEMBERS_DEFAULT_PAGE_SIZE),
    filter: parseListEnumFilter(
      parseListFilter(searchParams),
      MEMBER_TABLE_FILTERS,
      "all"
    ),
    q: parseListQuery(searchParams),
  }
}

export function organizationMembersTablePath(
  input: ListSearchParamsInput & { filter?: MemberTableFilter } = {}
): string {
  return listPath(
    dashboardRoutes.organizationMembers(),
    input,
    MEMBERS_DEFAULT_PAGE_SIZE
  )
}
