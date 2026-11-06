"use server"

import { headers } from "next/headers"
import { revalidateTag, updateTag } from "next/cache"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

type RemoveOrganizationMemberInput = {
  organizationId: string
  memberId: string
}

type RemoveOrganizationMemberResult = {
  success: boolean
  error?: string
}

export async function removeOrganizationMemberAction(
  input: RemoveOrganizationMemberInput
): Promise<RemoveOrganizationMemberResult> {
  try {
    await auth.api.removeMember({
      headers: await headers(),
      body: {
        memberIdOrEmail: input.memberId,
        organizationId: input.organizationId,
      },
    })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  updateTag(dashboardCacheTags.organizationMembersById(input.organizationId))
  // Member counts on the platform admin list; another actor reads those.
  revalidateTag(dashboardCacheTags.adminOrganizationsPage(), "max")
  return { success: true }
}
