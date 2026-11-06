"use server"

import {
  invalidateOrganizationBrandingCache,
  invalidateOrganizationMembersCache,
} from "@/app/action/dashboard/(organization)/manage/shared/invalidate-organization-manage-cache"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"
import { headers } from "next/headers"
import { after } from "next/server"
import { getTranslations } from "next-intl/server"
import { updateTag } from "next/cache"
import { auth, getAuthApiErrorMessage } from "@repo/auth"
import { deleteOwnedObjects } from "@repo/storage"

type DeleteOrganizationInput = {
  organizationId: string
}

type DeleteOrganizationResult = {
  success: boolean
  error?: string
  redirectTo?: string
}

export async function deleteOrganizationAction(
  input: DeleteOrganizationInput
): Promise<DeleteOrganizationResult> {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })

  if (!session) {
    const t = await getTranslations("common.errors")
    return { success: false, error: t("unauthorized") }
  }

  try {
    await auth.api.deleteOrganization({
      headers: requestHeaders,
      body: { organizationId: input.organizationId },
    })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  // The logo and any other files of the organization go with it.
  after(() => deleteOwnedObjects("organization", input.organizationId))

  invalidateOrganizationBrandingCache(input.organizationId)
  invalidateOrganizationMembersCache(input.organizationId)
  updateTag(dashboardCacheTags.adminOrganizationsPage())
  updateTag(dashboardCacheTags.sidebarConfigByUser(session.user.id))

  return { success: true, redirectTo: dashboardRoutes.home() }
}
