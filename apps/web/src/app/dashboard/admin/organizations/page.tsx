import { Suspense } from "react"
import { AdminOrganizationsTable } from "@/app/dashboard/admin/organizations/components/admin-organizations-table"
import { parseAdminOrganizationsPageQuery } from "@/app/dashboard/admin/organizations/lib/admin-organizations-table-params"
import { getAdminOrganizationsPage } from "@/app/dashboard/admin/organizations/lib/get-admin-organizations-page"
import { ListSkeleton } from "@/components/list"

type AdminOrganizationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default function AdminOrganizationsPage(
  props: AdminOrganizationsPageProps
) {
  return (
    <Suspense fallback={<ListSkeleton />}>
      <AdminOrganizationsPageContent {...props} />
    </Suspense>
  )
}

async function AdminOrganizationsPageContent({
  searchParams,
}: AdminOrganizationsPageProps) {
  const query = parseAdminOrganizationsPageQuery(await searchParams)
  const data = await getAdminOrganizationsPage(query)

  return (
    <AdminOrganizationsTable
      organizations={data.organizations}
      page={data.page}
      pageSize={data.pageSize}
      totalCount={data.totalCount}
      q={data.q}
    />
  )
}
