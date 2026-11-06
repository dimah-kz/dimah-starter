"use server"

import { headers } from "next/headers"
import { updateTag } from "next/cache"
import { after } from "next/server"
import { getTranslations } from "next-intl/server"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { auth, getAuthApiErrorMessage } from "@repo/auth"
import { deleteRouteObjects, toOwnedPublicUrl } from "@repo/storage"

type SetOrganizationLogoResult = {
  success: boolean
  error?: string
}

/** Logo of the active organization — the scope the `logo` upload route used. */
export async function setOrganizationLogoAction(
  key: string
): Promise<SetOrganizationLogoResult> {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })
  const organizationId = session?.session.activeOrganizationId
  const t = await getTranslations("common.errors")

  if (!organizationId) {
    return { success: false, error: t("unauthorized") }
  }

  const owned = await toOwnedPublicUrl({
    route: "logo",
    ownerId: organizationId,
    key,
  })

  if ("error" in owned) {
    return { success: false, error: t(owned.error) }
  }

  try {
    await auth.api.updateOrganization({
      headers: requestHeaders,
      body: { organizationId, data: { logo: owned.url } },
    })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  // The organization points at the new logo: drop the previous one.
  after(() =>
    deleteRouteObjects({
      route: "logo",
      ownerId: organizationId,
      keep: key,
      headers: requestHeaders,
    })
  )

  updateTag(dashboardCacheTags.organizationBrandingById(organizationId))
  return { success: true }
}
