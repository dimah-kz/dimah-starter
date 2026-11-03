"use server"

import { invalidateUserCache } from "@/app/dashboard/lib/invalidate-user-cache"
import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { auth, getAuthApiErrorMessage } from "@repo/auth"
import { fromPublicUrl, s3 } from "@repo/storage"

export async function removeAccountAvatarAction() {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })
  if (!session) {
    const t = await getTranslations("common.errors")
    return { error: t("unauthorized") }
  }

  const previousKey = session.user.image
    ? fromPublicUrl(session.user.image)
    : null

  try {
    await auth.api.updateUser({
      headers: requestHeaders,
      body: { image: "" },
    })
  } catch (error) {
    return { error: getAuthApiErrorMessage(error) }
  }

  if (previousKey) {
    try {
      await s3.api.delete(
        { route: "avatar", key: previousKey },
        { headers: requestHeaders }
      )
    } catch {
      // Best-effort — the profile link is already cleared.
    }
  }

  invalidateUserCache(session.user.id)
  return { success: true as const }
}
