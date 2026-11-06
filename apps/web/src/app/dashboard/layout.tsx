import type { Metadata } from "next"
import { Suspense } from "react"
import { Toaster as S3Toaster } from "@dimah-s3/ui"
import { DashboardHeader } from "@/app/dashboard/components/header/dashboard-header"
import { DashboardPageFallback } from "@/app/dashboard/components/layout/dashboard-page-shell"
import { AppSidebar } from "@/app/dashboard/components/sidebar/app-sidebar"
import { DashboardSidebarFallback } from "@/app/dashboard/components/sidebar/dashboard-sidebar-fallback"
import {
  OrganizationSwitchOverlay,
  OrganizationSwitchProvider,
} from "@/app/dashboard/components/sidebar/organization-switcher"
import { SidebarCloseOnNavigate } from "@/app/dashboard/components/sidebar/sidebar-close-on-navigate"
import { getDashboardSidebarProps } from "@/app/dashboard/lib/get-dashboard-sidebar-props"
import { requireDashboardSession } from "@/app/dashboard/lib/dashboard-session"
import { S3ClientProvider } from "@repo/storage/s3-client"
import { SidebarInset, SidebarProvider } from "@repo/ui/components/sidebar"
import { getLocale } from "next-intl/server"

type DashboardLayoutProps = {
  children: React.ReactNode
}

/** Private app surface — `robots.ts` also disallows crawling it. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

function DashboardShellFallback() {
  return (
    <>
      <DashboardSidebarFallback />
      <SidebarInset className="relative min-h-svh">
        <DashboardHeader />
        <DashboardPageFallback />
      </SidebarInset>
    </>
  )
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <OrganizationSwitchProvider>
      <SidebarProvider>
        <SidebarCloseOnNavigate />
        <Suspense fallback={<DashboardShellFallback />}>
          <DashboardShell>{children}</DashboardShell>
        </Suspense>
      </SidebarProvider>
    </OrganizationSwitchProvider>
  )
}

async function DashboardShell({ children }: DashboardLayoutProps) {
  const session = await requireDashboardSession()
  const sidebar = await getDashboardSidebarProps()
  const locale = await getLocale()

  return (
    <S3ClientProvider locale={locale}>
      <AppSidebar
        navGroups={sidebar.navGroups}
        navSections={sidebar.navSections}
        organizations={sidebar.organizations}
        activeOrganizationId={sidebar.activeOrganizationId}
        user={{
          name: session.user.name,
          email: session.user.email,
          avatar: session.user.image ?? "",
        }}
      />
      <SidebarInset className="relative min-h-svh">
        <OrganizationSwitchOverlay />
        <DashboardHeader />
        {children}
      </SidebarInset>
      <S3Toaster />
    </S3ClientProvider>
  )
}
