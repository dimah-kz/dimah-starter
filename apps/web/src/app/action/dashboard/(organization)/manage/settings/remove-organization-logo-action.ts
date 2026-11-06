"use server"

import { headers } from "next/headers"
import { updateTag } from "next/cache"
import { after } from "next/server"
import { getTranslations } from "next-intl/server"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { auth, getAuthApiErrorMessage } from "@repo/auth"
import { deleteRouteObjects } from "@repo/storage"

type RemoveOrganizationLogoResult = {
  success: boolean
  error?: string
}

/** Clears the logo of the active organization. */
export async function removeOrganizationLogoAction(): Promise<RemoveOrganizationLogoResult> {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })
  const organizationId = session?.session.activeOrganizationId

  if (!organizationId) {
    const t = await getTranslations("common.errors")
    return { success: false, error: t("unauthorized") }
  }

  try {
    await auth.api.updateOrganization({
      headers: requestHeaders,
      body: { organizationId, data: { logo: "" } },
    })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  // Cleared first, deleted after: the organization never points at a missing file.
  after(() =>
    deleteRouteObjects({
      route: "logo",
      ownerId: organizationId,
      headers: requestHeaders,
    })
  )

  updateTag(dashboardCacheTags.organizationBrandingById(organizationId))
  return { success: true }
}
