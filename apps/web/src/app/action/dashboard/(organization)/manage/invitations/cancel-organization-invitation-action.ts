"use server"

import { headers } from "next/headers"
import { updateTag } from "next/cache"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

type CancelOrganizationInvitationInput = {
  invitationId: string
}

type CancelOrganizationInvitationResult = {
  success: boolean
  error?: string
}

export async function cancelOrganizationInvitationAction(
  input: CancelOrganizationInvitationInput
): Promise<CancelOrganizationInvitationResult> {
  let organizationId: string | undefined

  try {
    const canceled = await auth.api.cancelInvitation({
      headers: await headers(),
      body: { invitationId: input.invitationId },
    })
    organizationId = canceled?.organizationId
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  // The tag comes from the invitation, never from the client.
  if (organizationId) {
    updateTag(dashboardCacheTags.organizationInvitationsById(organizationId))
  }
  return { success: true }
}
