import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"
import {
  listPath,
  parseListEnumFilter,
  type ListSearchParamsInput,
} from "@/components/list"

export const INVITATIONS_DEFAULT_PAGE_SIZE = 20

export type InvitationTableFilter =
  "all" | "pending" | "accepted" | "rejected" | "canceled"

const INVITATION_TABLE_FILTERS = [
  "all",
  "pending",
  "accepted",
  "rejected",
  "canceled",
] as const satisfies readonly InvitationTableFilter[]

export function parseInvitationTableFilter(
  value: string | undefined
): InvitationTableFilter {
  return parseListEnumFilter(value, INVITATION_TABLE_FILTERS, "all")
}

export function organizationInvitationsTablePath(
  input: ListSearchParamsInput & {
    filter?: InvitationTableFilter
  } = {}
): string {
  const filter =
    input.filter && input.filter !== "all" ? input.filter : undefined

  return listPath(
    dashboardRoutes.organizationInvitations(),
    {
      page: input.page,
      pageSize: input.pageSize,
      filter,
      q: input.q,
    },
    { defaultPageSize: INVITATIONS_DEFAULT_PAGE_SIZE }
  )
}
