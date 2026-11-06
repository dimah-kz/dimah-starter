"use server"

import { headers } from "next/headers"
import { updateTag } from "next/cache"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

type CancelOrganizationInvitationInput = {
  organizationId: string
  invitationId: string
}

type CancelOrganizationInvitationResult = {
  success: boolean
  error?: string
}

export async function cancelOrganizationInvitationAction(
  input: CancelOrganizationInvitationInput
): Promise<CancelOrganizationInvitationResult> {
  try {
    await auth.api.cancelInvitation({
      headers: await headers(),
      body: { invitationId: input.invitationId },
    })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  updateTag(
    dashboardCacheTags.organizationInvitationsById(input.organizationId)
  )
  return { success: true }
}
