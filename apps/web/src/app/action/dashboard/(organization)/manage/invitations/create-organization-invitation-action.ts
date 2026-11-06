"use server"

import { headers } from "next/headers"
import { updateTag } from "next/cache"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { auth, getAuthApiErrorMessage } from "@repo/auth"
import type { MembershipRole } from "@repo/auth/organization-access"

type CreateOrganizationInvitationInput = {
  organizationId: string
  email: string
  role: MembershipRole
}

type CreateOrganizationInvitationResult = {
  success: boolean
  error?: string
}

/** Better Auth checks the role exists and that only owners invite owners. */
export async function createOrganizationInvitationAction(
  input: CreateOrganizationInvitationInput
): Promise<CreateOrganizationInvitationResult> {
  try {
    await auth.api.createInvitation({
      headers: await headers(),
      body: {
        email: input.email,
        role: input.role,
        organizationId: input.organizationId,
        resend: true,
      },
    })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  updateTag(
    dashboardCacheTags.organizationInvitationsById(input.organizationId)
  )
  return { success: true }
}
