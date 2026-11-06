"use server"

import { headers } from "next/headers"
import { updateTag } from "next/cache"
import { getTranslations } from "next-intl/server"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { auth, getAuthApiErrorMessage } from "@repo/auth"
import type { MembershipRole } from "@repo/auth/organization-access"

type UpdateOrganizationMemberRoleInput = {
  organizationId: string
  memberId: string
  roles: MembershipRole[]
}

type UpdateOrganizationMemberRoleResult = {
  success: boolean
  error?: string
}

export async function updateOrganizationMemberRoleAction(
  input: UpdateOrganizationMemberRoleInput
): Promise<UpdateOrganizationMemberRoleResult> {
  if (!input.roles.length) {
    const t = await getTranslations("common.errors")
    return { success: false, error: t("selectRole") }
  }

  try {
    await auth.api.updateMemberRole({
      headers: await headers(),
      body: {
        memberId: input.memberId,
        role: input.roles,
        organizationId: input.organizationId,
      },
    })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  updateTag(dashboardCacheTags.organizationMembersById(input.organizationId))
  return { success: true }
}
