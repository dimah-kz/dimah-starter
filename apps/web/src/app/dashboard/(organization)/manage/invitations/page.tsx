import { Suspense } from "react"
import { InvitationManagementPanel } from "@/app/dashboard/(organization)/manage/invitations/components/invitation-management-panel"
import { getOrganizationInvitationsPage } from "@/app/dashboard/(organization)/manage/invitations/lib/get-organization-invitations-page"
import { parseOrganizationInvitationsPageQuery } from "@/app/dashboard/(organization)/manage/invitations/lib/invitations-table-params"
import { getActorOrganizationRole } from "@/app/dashboard/(organization)/manage/lib/get-actor-organization-role"
import { requireOrganizationManager } from "@/app/dashboard/lib/dashboard-session"
import { ListSkeleton } from "@/components/list"

type OrganizationInvitationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default function OrganizationInvitationsPage(
  props: OrganizationInvitationsPageProps
) {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <OrganizationInvitationsPageContent {...props} />
    </Suspense>
  )
}

async function OrganizationInvitationsPageContent({
  searchParams,
}: OrganizationInvitationsPageProps) {
  const query = parseOrganizationInvitationsPageQuery(await searchParams)
  const [{ organizationId }, data, actorRole] = await Promise.all([
    requireOrganizationManager(),
    getOrganizationInvitationsPage(query),
    getActorOrganizationRole(),
  ])

  return (
    <InvitationManagementPanel
      organizationId={organizationId}
      invitations={data.invitations}
      page={data.page}
      pageSize={data.pageSize}
      totalCount={data.totalCount}
      filter={data.filter}
      q={data.q}
      actorRole={actorRole}
    />
  )
}
