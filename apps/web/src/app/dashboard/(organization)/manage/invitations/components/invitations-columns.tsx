"use client"

import { XIcon } from "lucide-react"
import { dateTimeOptions, formatDate, type Locale } from "@repo/i18n"
import { Button } from "@repo/ui/components/button"
import type { OrganizationInvitationItem } from "@/app/dashboard/(organization)/manage/invitations/lib/get-organization-invitations-page"
import { InvitationStatusBadge } from "@/components/badge/invitation-status-badge"
import { MembershipRoleBadge } from "@/components/badge/membership-role-badge"
import type { ListColumn } from "@/components/list"

function invitationDisplayStatus(row: OrganizationInvitationItem) {
  if (
    row.status === "pending" &&
    new Date(row.expiresAt).getTime() < Date.now()
  ) {
    return "expired"
  }

  return row.status
}

type TablesTranslator = {
  (key: "columns.email"): string
  (key: "columns.role"): string
  (key: "columns.status"): string
  (key: "columns.expires"): string
  (key: "columns.actions"): string
}

type CreateInvitationsColumnsOptions = {
  t: TablesTranslator
  tManage: (key: "rowActions", values: { email: string }) => string
  locale: Locale
  disabled?: boolean
  onCancel: (invitation: OrganizationInvitationItem) => void
}

export function createInvitationsColumns({
  t,
  tManage,
  locale,
  disabled,
  onCancel,
}: CreateInvitationsColumnsOptions): ListColumn<OrganizationInvitationItem>[] {
  return [
    {
      id: "email",
      header: t("columns.email"),
      className: "w-full min-w-0",
      cell: (row) => <span className="truncate">{row.email}</span>,
    },
    {
      id: "role",
      header: t("columns.role"),
      className: "min-w-28",
      cell: (row) => <MembershipRoleBadge role={row.role} />,
    },
    {
      id: "status",
      header: t("columns.status"),
      className: "min-w-28",
      cell: (row) => (
        <InvitationStatusBadge status={invitationDisplayStatus(row)} />
      ),
    },
    {
      id: "expires",
      header: t("columns.expires"),
      className: "min-w-40 text-muted-foreground",
      cell: (row) => formatDate(row.expiresAt, locale, dateTimeOptions),
    },
    {
      id: "actions",
      header: <span className="sr-only">{t("columns.actions")}</span>,
      className: "w-12 text-end",
      cell: (row) =>
        row.status === "pending" ? (
          <Button
            type="button"
            size="icon-sm"
            variant="ghost"
            aria-label={tManage("rowActions", { email: row.email })}
            disabled={disabled}
            onClick={() => onCancel(row)}
          >
            <XIcon />
          </Button>
        ) : null,
    },
  ]
}
