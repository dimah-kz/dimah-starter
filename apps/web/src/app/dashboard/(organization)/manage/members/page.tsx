import { Suspense } from "react"
import { MemberManagementPanel } from "@/app/dashboard/(organization)/manage/members/components/member-management-panel"
import { getOrganizationMembersPage } from "@/app/dashboard/(organization)/manage/members/lib/get-organization-members-page"
import { parseOrganizationMembersPageQuery } from "@/app/dashboard/(organization)/manage/members/lib/members-table-params"
import { getActorOrganizationRole } from "@/app/dashboard/(organization)/manage/lib/get-actor-organization-role"
import { requireOrganizationManager } from "@/app/dashboard/lib/dashboard-session"
import { ListSkeleton } from "@/components/list"

type OrganizationMembersPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default function OrganizationMembersPage(
  props: OrganizationMembersPageProps
) {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <OrganizationMembersPageContent {...props} />
    </Suspense>
  )
}

async function OrganizationMembersPageContent({
  searchParams,
}: OrganizationMembersPageProps) {
  const query = parseOrganizationMembersPageQuery(await searchParams)
  const [{ session, organizationId }, data, actorRole] = await Promise.all([
    requireOrganizationManager(),
    getOrganizationMembersPage(query),
    getActorOrganizationRole(),
  ])

  return (
    <MemberManagementPanel
      organizationId={organizationId}
      members={data.members}
      page={data.page}
      pageSize={data.pageSize}
      totalCount={data.totalCount}
      filter={data.filter}
      q={data.q}
      actorUserId={session.user.id}
      actorRole={actorRole}
    />
  )
}
