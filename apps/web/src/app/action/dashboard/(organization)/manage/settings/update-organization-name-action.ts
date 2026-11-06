"use server"

import { headers } from "next/headers"
import { updateTag } from "next/cache"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

type UpdateOrganizationNameInput = {
  organizationId: string
  name: string
}

type UpdateOrganizationNameResult = {
  success: boolean
  error?: string
}

export async function updateOrganizationNameAction(
  input: UpdateOrganizationNameInput
): Promise<UpdateOrganizationNameResult> {
  try {
    await auth.api.updateOrganization({
      headers: await headers(),
      body: {
        organizationId: input.organizationId,
        data: { name: input.name.trim() },
      },
    })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  updateTag(dashboardCacheTags.organizationBrandingById(input.organizationId))
  return { success: true }
}
