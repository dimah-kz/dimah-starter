"use server"

import { invalidateOrganizationBrandingCache } from "@/app/action/dashboard/(organization)/manage/shared/invalidate-organization-manage-cache"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { updateTag } from "next/cache"
import { auth, getAuthApiErrorMessage } from "@repo/auth"
import { deleteRouteObjects, toOwnedPublicUrl } from "@repo/storage"

export async function setOrganizationLogoAction(
  organizationId: string,
  key: string
) {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })
  const t = await getTranslations("common.errors")
  if (!session) {
    return { error: t("unauthorized") }
  }

  const owned = await toOwnedPublicUrl({
    route: "logo",
    ownerId: organizationId,
    key,
  })
  if ("error" in owned) {
    return {
      error: t(
        owned.error === "unconfigured"
          ? "storagePublicUrlMissing"
          : "invalidImageKey"
      ),
    }
  }
  const imageUrl = owned.url

  try {
    await auth.api.updateOrganization({
      headers: requestHeaders,
      body: {
        organizationId,
        data: { logo: imageUrl },
      },
    })
  } catch (error) {
    return { error: getAuthApiErrorMessage(error) }
  }

  // The organization points at the new logo: drop the previous one.
  await deleteRouteObjects({
    route: "logo",
    ownerId: organizationId,
    keep: key,
    headers: requestHeaders,
  })

  invalidateOrganizationBrandingCache(organizationId)
  updateTag(dashboardCacheTags.sidebarConfigByUser(session.user.id))

  return { success: true as const, imageUrl }
}
