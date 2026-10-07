import { Suspense } from "react"
import { redirect } from "next/navigation"
import { InvitationManagementPanel } from "@/app/dashboard/(organization)/manage/invitations/components/invitation-management-panel"
import {
  getOrganizationInvitationsPage,
  parseOrganizationInvitationsPageQuery,
} from "@/app/dashboard/(organization)/manage/invitations/lib/get-organization-invitations-page"
import { getActorOrganizationRole } from "@/app/dashboard/(organization)/manage/lib/get-actor-organization-role"
import {
  requireDashboardSession,
  resolveDashboardActiveOrganizationId,
} from "@/app/dashboard/lib/dashboard-session"
import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"
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
  const [organizationId, resolvedSearchParams] = await Promise.all([
    resolveDashboardActiveOrganizationId(),
    searchParams,
    requireDashboardSession(),
  ])

  if (!organizationId) {
    redirect(dashboardRoutes.home())
  }

  const query = parseOrganizationInvitationsPageQuery(resolvedSearchParams)
  const [data, actorRole] = await Promise.all([
    getOrganizationInvitationsPage(organizationId, query),
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
