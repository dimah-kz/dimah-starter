"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

type SetActiveOrganizationInput = {
  /** `null` switches to the personal account. */
  organizationId: string | null
}

type SetActiveOrganizationResult = {
  success: false
  error?: string
}

/** Switches the session's organization, then opens the dashboard home. */
export async function setActiveOrganizationAction(
  input: SetActiveOrganizationInput
): Promise<SetActiveOrganizationResult> {
  try {
    await auth.api.setActiveOrganization({
      headers: await headers(),
      body: { organizationId: input.organizationId },
    })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  redirect(dashboardRoutes.home())
}
