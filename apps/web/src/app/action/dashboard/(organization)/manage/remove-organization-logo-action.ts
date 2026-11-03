"use server"

import { invalidateOrganizationBrandingCache } from "@/app/action/dashboard/(organization)/manage/shared/invalidate-organization-manage-cache"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { updateTag } from "next/cache"
import { auth, getAuthApiErrorMessage } from "@repo/auth"
import { fromPublicUrl, s3 } from "@repo/storage"

export async function removeOrganizationLogoAction(organizationId: string) {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })
  if (!session) {
    const t = await getTranslations("common.errors")
    return { error: t("unauthorized") }
  }

  const organizations = await auth.api.listOrganizations({
    headers: requestHeaders,
  })
  const current = organizations.find(
    (organization) => organization.id === organizationId
  )
  const previousKey = current?.logo ? fromPublicUrl(current.logo) : null

  try {
    await auth.api.updateOrganization({
      headers: requestHeaders,
      body: {
        organizationId,
        data: { logo: "" },
      },
    })
  } catch (error) {
    return { error: getAuthApiErrorMessage(error) }
  }

  if (previousKey) {
    try {
      await s3.api.delete(
        { route: "logo", key: previousKey },
        { headers: requestHeaders }
      )
    } catch {
      // Best-effort — the logo link is already cleared.
    }
  }

  invalidateOrganizationBrandingCache(organizationId)
  updateTag(dashboardCacheTags.sidebarConfigByUser(session.user.id))

  return { success: true as const }
}
