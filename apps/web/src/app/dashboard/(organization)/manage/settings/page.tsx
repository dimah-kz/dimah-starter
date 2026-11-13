import { notFound } from "next/navigation"
import { Suspense } from "react"
import { getActiveOrganizationBranding } from "@/app/dashboard/(organization)/manage/settings/lib/get-active-organization-branding"
import { OrganizationSettingsHub } from "@/app/dashboard/(organization)/manage/settings/components/organization-settings-hub"
import { DashboardPageFallback } from "@/app/dashboard/components/layout/dashboard-page-shell"
import {
  dashboardAuthHeaders,
  requireOrganizationManager,
} from "@/app/dashboard/lib/dashboard-session"
import { auth } from "@repo/auth"
import { fromPublicUrl } from "@repo/storage"

export default function OrganizationSettingsPage() {
  return (
    <Suspense fallback={<DashboardPageFallback />}>
      <OrganizationSettingsPageContent />
    </Suspense>
  )
}

async function OrganizationSettingsPageContent() {
  const { organizationId } = await requireOrganizationManager()
  const requestHeaders = await dashboardAuthHeaders()
  const [organization, { success: canEdit }, { success: canDelete }] =
    await Promise.all([
      getActiveOrganizationBranding(),
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

  if (!organization) {
    notFound()
  }

  return (
    <OrganizationSettingsHub
      organization={{
        ...organization,
        logoKey: organization.logo ? fromPublicUrl(organization.logo) : null,
      }}
      canEdit={canEdit}
      canDelete={canDelete}
    />
  )
}
