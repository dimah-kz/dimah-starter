import { notFound, redirect } from "next/navigation"
import { Suspense } from "react"
import { getActiveOrganizationBranding } from "@/app/dashboard/(organization)/manage/settings/lib/get-active-organization-branding"
import { OrganizationSettingsHub } from "@/app/dashboard/(organization)/manage/settings/components/organization-settings-hub"
import { DashboardPageFallback } from "@/app/dashboard/components/layout/dashboard-page-shell"
import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"
import { resolveDashboardActiveOrganizationId } from "@/app/dashboard/lib/dashboard-session"
import { headers } from "next/headers"
import { auth } from "@repo/auth"

export default function OrganizationSettingsPage() {
  return (
    <Suspense fallback={<DashboardPageFallback />}>
      <OrganizationSettingsPageContent />
    </Suspense>
  )
}

async function OrganizationSettingsPageContent() {
  const organizationId = await resolveDashboardActiveOrganizationId()

  if (!organizationId) {
    redirect(dashboardRoutes.home())
  }

  const organization = await getActiveOrganizationBranding(organizationId)

  if (!organization) {
    notFound()
  }

  const requestHeaders = await headers()
  const [{ success: canEdit }, { success: canDelete }] = await Promise.all([
    auth.api.hasPermission({
      headers: requestHeaders,
      body: {
        organizationId,
        permissions: { organization: ["update"] },
      },
    }),
    auth.api.hasPermission({
      headers: requestHeaders,
      body: {
        organizationId,
        permissions: { organization: ["delete"] },
      },
    }),
  ])

  return (
    <OrganizationSettingsHub
      organization={organization}
      canEdit={canEdit}
      canDelete={canDelete}
    />
  )
}
