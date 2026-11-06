import { Suspense } from "react"
import {
  DashboardPageFallback,
  DashboardPageShell,
} from "@/app/dashboard/components/layout/dashboard-page-shell"
import { DashboardSectionHeading } from "@/app/dashboard/components/layout/dashboard-section-heading"
import { requireOrganizationManager } from "@/app/dashboard/lib/dashboard-session"

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
  await requireOrganizationManager()

  return (
    <DashboardPageShell>
      <DashboardSectionHeading />
      {children}
    </DashboardPageShell>
  )
}
