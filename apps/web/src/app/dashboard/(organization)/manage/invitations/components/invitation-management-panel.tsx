"use client"

import { useState } from "react"
import { InvitationFormShell } from "@/app/dashboard/(organization)/manage/invitations/components/invitation-form-shell"
import { InvitationsTable } from "@/app/dashboard/(organization)/manage/invitations/components/invitations-table"
import type { OrganizationInvitationItem } from "@/app/dashboard/(organization)/manage/invitations/lib/get-organization-invitations-page"
import type { InvitationTableFilter } from "@/app/dashboard/(organization)/manage/invitations/lib/invitations-table-params"

type InvitationManagementPanelProps = {
  organizationId: string
  invitations: OrganizationInvitationItem[]
  page: number
  pageSize: number
  totalCount: number
  filter: InvitationTableFilter
  q?: string
  actorRole: string | null
}

export function InvitationManagementPanel({
  organizationId,
  invitations,
  page,
  pageSize,
  totalCount,
  filter,
  q,
  actorRole,
}: InvitationManagementPanelProps) {
  const [inviteOpen, setInviteOpen] = useState(false)

  return (
    <>
      <InvitationsTable
        organizationId={organizationId}
        invitations={invitations}
        page={page}
        pageSize={pageSize}
        totalCount={totalCount}
        filter={filter}
        q={q}
        onInvite={() => setInviteOpen(true)}
      />
      <InvitationFormShell
        organizationId={organizationId}
        actorRole={actorRole}
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
      />
    </>
  )
}
