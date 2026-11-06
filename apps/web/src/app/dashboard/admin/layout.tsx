import { Suspense } from "react"
import {
  DashboardPageFallback,
  DashboardPageShell,
} from "@/app/dashboard/components/layout/dashboard-page-shell"
import { DashboardSectionHeading } from "@/app/dashboard/components/layout/dashboard-section-heading"
import { requirePlatformAdmin } from "@/app/dashboard/lib/dashboard-session"

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
  await requirePlatformAdmin()

  return (
    <DashboardPageShell>
      <DashboardSectionHeading />
      {children}
    </DashboardPageShell>
  )
}
