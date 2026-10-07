import { redirect } from "next/navigation"
import { Suspense } from "react"
import {
  DashboardPageFallback,
  DashboardPageShell,
} from "@/app/dashboard/components/layout/dashboard-page-shell"
import { dashboardAuthHeaders } from "@/app/dashboard/lib/dashboard-session"
import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"
import { auth } from "@repo/auth"

type AdminLayoutProps = {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <Suspense fallback={<DashboardPageFallback />}>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </Suspense>
  )
}

async function AdminLayoutContent({ children }: AdminLayoutProps) {
  const { success } = await auth.api.userHasPermission({
    headers: await dashboardAuthHeaders(),
    body: { permissions: { user: ["list"] } },
  })

  if (!success) {
    redirect(dashboardRoutes.home())
  }

  return <DashboardPageShell>{children}</DashboardPageShell>
}
