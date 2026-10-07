"use server"

import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { invalidateOrganizationInvitationsCache } from "@/app/action/dashboard/(organization)/manage/shared/invalidate-organization-manage-cache"
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
    const t = await getTranslations("dashboard.invitationManage")
    return {
      success: false,
      error: getAuthApiErrorMessage(error) || t("cancelFailed"),
    }
  }

  invalidateOrganizationInvitationsCache(input.organizationId)
  return { success: true }
}
