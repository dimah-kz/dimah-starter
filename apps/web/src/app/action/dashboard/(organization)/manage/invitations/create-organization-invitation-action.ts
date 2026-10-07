"use server"

import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { invalidateOrganizationInvitationsCache } from "@/app/action/dashboard/(organization)/manage/shared/invalidate-organization-manage-cache"
import { memberRoleOptions } from "@/app/dashboard/(organization)/manage/lib/member-role-options"
import { auth, getAuthApiErrorMessage } from "@repo/auth"
import type { MembershipRole } from "@repo/auth/organization-access"

function isMembershipRole(role: string): role is MembershipRole {
  return role === "owner" || role === "admin" || role === "member"
}

type CreateOrganizationInvitationInput = {
  organizationId: string
  email: string
  role: string
}

type CreateOrganizationInvitationResult = {
  success: boolean
  error?: string
}

export async function createOrganizationInvitationAction(
  input: CreateOrganizationInvitationInput
): Promise<CreateOrganizationInvitationResult> {
  const requestHeaders = await headers()

  try {
    const actor = await auth.api.getActiveMemberRole({
      headers: requestHeaders,
    })
    const allowed = memberRoleOptions(actor.role)

    if (!isMembershipRole(input.role) || !allowed.includes(input.role)) {
      const t = await getTranslations("common.errors")
      return { success: false, error: t("invalidRole") }
    }

    await auth.api.createInvitation({
      headers: requestHeaders,
      body: {
        email: input.email,
        role: input.role,
        organizationId: input.organizationId,
        resend: true,
      },
    })
  } catch (error) {
    const t = await getTranslations("dashboard.invitationManage")
    return {
      success: false,
      error: getAuthApiErrorMessage(error) || t("sendFailed"),
    }
  }

  invalidateOrganizationInvitationsCache(input.organizationId)
  return { success: true }
}
