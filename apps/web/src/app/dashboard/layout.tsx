import type { Metadata } from "next"
import { Suspense } from "react"
import { Toaster as S3Toaster } from "@dimah-s3/ui"
import { DashboardHeader } from "@/app/dashboard/components/header/dashboard-header"
import { DashboardS3Provider } from "@/app/dashboard/components/layout/dashboard-s3-provider"
import { AppSidebar } from "@/app/dashboard/components/sidebar/app-sidebar"
import { DashboardSidebarFallback } from "@/app/dashboard/components/sidebar/dashboard-sidebar-fallback"
import {
  OrganizationSwitchOverlay,
  OrganizationSwitchProvider,
} from "@/app/dashboard/components/sidebar/organization-switcher"
import { SidebarCloseOnNavigate } from "@/app/dashboard/components/sidebar/sidebar-close-on-navigate"
import { getDashboardSidebarProps } from "@/app/dashboard/lib/get-dashboard-sidebar-props"
import { requireDashboardSession } from "@/app/dashboard/lib/dashboard-session"
import { SidebarInset, SidebarProvider } from "@repo/ui/components/sidebar"

type DashboardLayoutProps = {
  children: React.ReactNode
}

/** Private app surface — `robots.ts` also disallows crawling it. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <OrganizationSwitchProvider>
      <DashboardS3Provider>
        <SidebarProvider>
          <SidebarCloseOnNavigate />
          <Suspense fallback={<DashboardSidebarFallback />}>
            <DashboardSidebar />
          </Suspense>
          <SidebarInset className="relative min-h-svh">
            <OrganizationSwitchOverlay />
            <Suspense fallback={<DashboardHeaderFallback />}>
              <DashboardHeaderSlot />
            </Suspense>
            {children}
          </SidebarInset>
          <S3Toaster />
        </SidebarProvider>
      </DashboardS3Provider>
    </OrganizationSwitchProvider>
  )
}

function DashboardHeaderFallback() {
  return <header className="mt-2 h-12 shrink-0" />
}

/** Breadcrumbs name the route. Wait for a session so signed-out visits redirect first. */
async function DashboardHeaderSlot() {
  await requireDashboardSession()
  return <DashboardHeader />
}

/**
 * Session chrome only. `{children}` stays outside this await: `io()` inside
 * the session read never resolves during prerender, and holding the page slot
 * there blocks instant validation.
 */
async function DashboardSidebar() {
  const session = await requireDashboardSession()
  const sidebar = await getDashboardSidebarProps()

  return (
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
  )
}
