import { Suspense } from "react"
import { redirect } from "next/navigation"
import {
  DashboardPageFallback,
  DashboardPageShell,
} from "@/app/dashboard/components/layout/dashboard-page-shell"
import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"
import {
  dashboardAuthHeaders,
  resolveDashboardActiveOrganizationId,
} from "@/app/dashboard/lib/dashboard-session"
import { auth } from "@repo/auth"

type OrganizationManageLayoutProps = {
  children: React.ReactNode
}

export default function OrganizationManageLayout({
  children,
}: OrganizationManageLayoutProps) {
  return (
    <Suspense fallback={<DashboardPageFallback />}>
      <OrganizationManageLayoutContent>
        {children}
      </OrganizationManageLayoutContent>
    </Suspense>
  )
}

async function OrganizationManageLayoutContent({
  children,
}: OrganizationManageLayoutProps) {
  const organizationId = await resolveDashboardActiveOrganizationId()

  if (!organizationId) {
    redirect(dashboardRoutes.home())
  }

  const { success } = await auth.api.hasPermission({
    headers: await dashboardAuthHeaders(),
    body: {
      organizationId,
      permissions: { member: ["update"] },
    },
  })

  if (!success) {
    redirect(dashboardRoutes.home())
  }

  return <DashboardPageShell>{children}</DashboardPageShell>
}
