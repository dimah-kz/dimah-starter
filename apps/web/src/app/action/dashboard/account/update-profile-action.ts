"use server"

import { headers } from "next/headers"
import { revalidateTag, updateTag } from "next/cache"
import { getTranslations } from "next-intl/server"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { getFormString, NAME_MAX_LENGTH } from "@/components/form/form-parse"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

type UpdateProfileResult = {
  success: boolean
  error?: string
}

export async function updateProfileAction(
  formData: FormData
): Promise<UpdateProfileResult> {
  const name = getFormString(formData, "name")

  // Better Auth accepts any string, including the empty one.
  if (!name || name.length > NAME_MAX_LENGTH) {
    const t = await getTranslations("common.errors")
    return { success: false, error: t("nameInvalid", { max: NAME_MAX_LENGTH }) }
  }

  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })

  try {
    await auth.api.updateUser({
      headers: requestHeaders,
      body: { name },
    })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  if (session) {
    updateTag(dashboardCacheTags.userProfileById(session.user.id))
  }
  revalidateTag(dashboardCacheTags.adminUsersPage(), "max")

  return { success: true }
}
