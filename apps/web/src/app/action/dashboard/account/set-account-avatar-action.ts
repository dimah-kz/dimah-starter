"use server"

import { invalidateUserCache } from "@/app/dashboard/lib/invalidate-user-cache"
import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { auth, getAuthApiErrorMessage } from "@repo/auth"
import { deleteRouteObjects, toOwnedPublicUrl } from "@repo/storage"

export async function setAccountAvatarAction(key: string) {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })
  const t = await getTranslations("common.errors")
  if (!session) {
    return { error: t("unauthorized") }
  }

  const owned = await toOwnedPublicUrl({
    route: "avatar",
    ownerId: session.user.id,
    key,
  })
  if ("error" in owned) {
    return {
      error: t(
        owned.error === "unconfigured"
          ? "storagePublicUrlMissing"
          : "invalidImageKey"
      ),
    }
  }
  const imageUrl = owned.url

  try {
    await auth.api.updateUser({
      headers: requestHeaders,
      body: { image: imageUrl },
    })
  } catch (error) {
    return { error: getAuthApiErrorMessage(error) }
  }

  // The profile points at the new image: drop the previous one.
  await deleteRouteObjects({
    route: "avatar",
    ownerId: session.user.id,
    keep: key,
    headers: requestHeaders,
  })

  invalidateUserCache(session.user.id)
  return { success: true as const, imageUrl }
}
