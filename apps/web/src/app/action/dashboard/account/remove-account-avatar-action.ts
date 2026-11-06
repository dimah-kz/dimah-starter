"use server"

import { headers } from "next/headers"
import { updateTag } from "next/cache"
import { after } from "next/server"
import { getTranslations } from "next-intl/server"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { auth, getAuthApiErrorMessage } from "@repo/auth"
import { deleteRouteObjects } from "@repo/storage"

type RemoveAccountAvatarResult = {
  success: boolean
  error?: string
}

export async function removeAccountAvatarAction(): Promise<RemoveAccountAvatarResult> {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })

  if (!session) {
    const t = await getTranslations("common.errors")
    return { success: false, error: t("unauthorized") }
  }

  const userId = session.user.id

  try {
    await auth.api.updateUser({
      headers: requestHeaders,
      body: { image: "" },
    })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  // Cleared first, deleted after: the profile never points at a missing file.
  after(() =>
    deleteRouteObjects({
      route: "avatar",
      ownerId: userId,
      headers: requestHeaders,
    })
  )

  updateTag(dashboardCacheTags.userProfileById(userId))
  return { success: true }
}
