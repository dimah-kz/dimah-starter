import { Suspense } from "react"
import { DashboardPageShell } from "@/app/dashboard/components/layout/dashboard-page-shell"
import { DashboardSectionHeading } from "@/app/dashboard/components/layout/dashboard-section-heading"
import { requireOrganizationManager } from "@/app/dashboard/lib/dashboard-session"

type OrganizationManageLayoutProps = {
  children: React.ReactNode
}

export default function OrganizationManageLayout({
  children,
}: OrganizationManageLayoutProps) {
  return (
    <DashboardPageShell>
      <Suspense fallback={null}>
        <OrganizationManageAccessGate />
      </Suspense>
      {children}
    </DashboardPageShell>
  )
}

/** Redirects users who cannot manage the active organization, without holding the page. */
async function OrganizationManageAccessGate() {
  await requireOrganizationManager()
  return <DashboardSectionHeading />
}
