"use server"

import { updateTag } from "next/cache"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"
import {
  clearDashboardActiveOrganization,
  setDashboardActiveOrganization,
} from "@/app/dashboard/lib/dashboard-session"
import { headers } from "next/headers"
import { auth } from "@repo/auth"

type SetActiveOrganizationInput = {
  organizationId: string | null
  redirectTo?: string
}

type SetActiveOrganizationResult = {
  redirectTo: string
}

export async function setActiveOrganizationAction({
  organizationId,
  redirectTo,
}: SetActiveOrganizationInput): Promise<SetActiveOrganizationResult> {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) {
    return { redirectTo: dashboardRoutes.home() }
  }

  const previousOrganizationId = session.session.activeOrganizationId ?? null

  if (organizationId === null) {
    if (previousOrganizationId !== null) {
      await clearDashboardActiveOrganization()
      updateTag(dashboardCacheTags.sidebarConfigByUser(session.user.id))
    }

    return {
      redirectTo: redirectTo ?? dashboardRoutes.home(),
    }
  }

  await setDashboardActiveOrganization(organizationId)

  if (previousOrganizationId !== organizationId) {
    updateTag(dashboardCacheTags.sidebarConfigByUser(session.user.id))
  }

  return {
    redirectTo: redirectTo ?? dashboardRoutes.home(),
  }
}
