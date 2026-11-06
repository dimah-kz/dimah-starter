"use server"

import { invalidateOrganizationBrandingCache } from "@/app/action/dashboard/(organization)/manage/shared/invalidate-organization-manage-cache"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { updateTag } from "next/cache"
import { auth, getAuthApiErrorMessage } from "@repo/auth"
import { deleteRouteObjects } from "@repo/storage"

export async function removeOrganizationLogoAction(organizationId: string) {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })
  if (!session) {
    const t = await getTranslations("common.errors")
    return { error: t("unauthorized") }
  }

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

  await deleteRouteObjects({
    route: "logo",
    ownerId: organizationId,
    headers: requestHeaders,
  })

  invalidateOrganizationBrandingCache(organizationId)
  updateTag(dashboardCacheTags.sidebarConfigByUser(session.user.id))

  return { success: true as const }
}
