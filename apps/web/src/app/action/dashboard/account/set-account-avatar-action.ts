"use server"

import { headers } from "next/headers"
import { revalidateTag, updateTag } from "next/cache"
import { after } from "next/server"
import { getTranslations } from "next-intl/server"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { auth, getAuthApiErrorMessage } from "@repo/auth"
import { deleteRouteObjects, toOwnedPublicUrl } from "@repo/storage"

type SetAccountAvatarResult = {
  success: boolean
  error?: string
}

export async function setAccountAvatarAction(
  key: string
): Promise<SetAccountAvatarResult> {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })
  const t = await getTranslations("common.errors")

  if (!session) {
    return { success: false, error: t("unauthorized") }
  }

  const userId = session.user.id
  const owned = await toOwnedPublicUrl({
    route: "avatar",
    ownerId: userId,
    key,
  })

  if ("error" in owned) {
    return { success: false, error: t(owned.error) }
  }

  try {
    await auth.api.updateUser({
      headers: requestHeaders,
      body: { image: owned.url },
    })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  // The profile points at the new image: drop the previous one.
  after(() =>
    deleteRouteObjects({
      route: "avatar",
      ownerId: userId,
      keep: key,
      headers: requestHeaders,
    })
  )

  updateTag(dashboardCacheTags.userProfileById(userId))
  revalidateTag(dashboardCacheTags.adminUsersPage(), "max")
  return { success: true }
}
