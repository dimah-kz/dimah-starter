import { DashboardPageShell } from "@/app/dashboard/components/layout/dashboard-page-shell"
import { DashboardSectionHeading } from "@/app/dashboard/components/layout/dashboard-section-heading"

type AccountLayoutProps = {
  children: React.ReactNode
}

/** Each page gates its own reads; the sidebar is the section's navigation. */
export default function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <DashboardPageShell>
      <div className="flex w-full max-w-3xl flex-col gap-6">
        <DashboardSectionHeading />
        {children}
      </div>
    </DashboardPageShell>
  )
}
