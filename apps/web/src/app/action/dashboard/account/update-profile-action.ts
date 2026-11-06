"use server"

import { headers } from "next/headers"
import { updateTag } from "next/cache"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { getFormString } from "@/components/form/form-parse"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

type UpdateProfileResult = {
  success: boolean
  error?: string
}

export async function updateProfileAction(
  formData: FormData
): Promise<UpdateProfileResult> {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })

  try {
    await auth.api.updateUser({
      headers: requestHeaders,
      body: { name: getFormString(formData, "name") },
    })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  if (session) {
    updateTag(dashboardCacheTags.userProfileById(session.user.id))
  }

  return { success: true }
}
