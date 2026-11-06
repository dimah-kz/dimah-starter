import { Suspense } from "react"
import { DashboardOrganizationsCard } from "@/app/dashboard/components/home/dashboard-organizations-card"
import {
  DashboardPageFallback,
  DashboardPageShell,
} from "@/app/dashboard/components/layout/dashboard-page-shell"
import {
  listDashboardOrganizations,
  requireDashboardSession,
  resolveDashboardActiveOrganizationId,
} from "@/app/dashboard/lib/dashboard-session"

export default function DashboardPage() {
  return (
    <DashboardPageShell>
      <Suspense fallback={<DashboardPageFallback />}>
        <DashboardHome />
      </Suspense>
    </DashboardPageShell>
  )
}

async function DashboardHome() {
  await requireDashboardSession()
  const [organizations, activeOrganizationId] = await Promise.all([
    listDashboardOrganizations(),
    resolveDashboardActiveOrganizationId(),
  ])

  const organizationItems = organizations.map((organization) => ({
    id: organization.id,
    name: organization.name,
    logo: organization.logo ?? null,
  }))

  return (
    <DashboardOrganizationsCard
      organizations={organizationItems}
      activeOrganizationId={activeOrganizationId}
    />
  )
}
