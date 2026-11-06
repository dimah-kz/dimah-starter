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

export const INVITATIONS_DEFAULT_PAGE_SIZE = 20

export const INVITATION_TABLE_FILTERS = [
  "all",
  "pending",
  "accepted",
  "rejected",
  "canceled",
] as const

export type InvitationTableFilter = (typeof INVITATION_TABLE_FILTERS)[number]

export type OrganizationInvitationsPageQuery = {
  page: number
  pageSize: number
  filter: InvitationTableFilter
  q?: string
}

export function parseOrganizationInvitationsPageQuery(
  searchParams: Record<string, string | string[] | undefined>
): OrganizationInvitationsPageQuery {
  return {
    page: parseListPage(searchParams),
    pageSize: parseListPageSize(searchParams, INVITATIONS_DEFAULT_PAGE_SIZE),
    filter: parseListEnumFilter(
      parseListFilter(searchParams),
      INVITATION_TABLE_FILTERS,
      "all"
    ),
    q: parseListQuery(searchParams),
  }
}

export function organizationInvitationsTablePath(
  input: ListSearchParamsInput & { filter?: InvitationTableFilter } = {}
): string {
  return listPath(
    dashboardRoutes.organizationInvitations(),
    input,
    INVITATIONS_DEFAULT_PAGE_SIZE
  )
}
