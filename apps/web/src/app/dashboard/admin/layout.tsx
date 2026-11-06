import { Suspense } from "react"
import { DashboardPageShell } from "@/app/dashboard/components/layout/dashboard-page-shell"
import { DashboardSectionHeading } from "@/app/dashboard/components/layout/dashboard-section-heading"
import { requirePlatformAdmin } from "@/app/dashboard/lib/dashboard-session"

type AdminLayoutProps = {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <DashboardPageShell>
      <Suspense fallback={null}>
        <AdminAccessGate />
      </Suspense>
      {children}
    </DashboardPageShell>
  )
}

/** Redirects non-admins. The page slot is a sibling, so this read cannot block it. */
async function AdminAccessGate() {
  await requirePlatformAdmin()
  return <DashboardSectionHeading />
}
