"use server"

import { invalidateUserCache } from "@/app/dashboard/lib/invalidate-user-cache"
import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { auth, getAuthApiErrorMessage } from "@repo/auth"
import { deleteRouteObjects } from "@repo/storage"

export async function removeAccountAvatarAction() {
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })
  if (!session) {
    const t = await getTranslations("common.errors")
    return { error: t("unauthorized") }
  }

  try {
    await auth.api.updateUser({
      headers: requestHeaders,
      body: { image: "" },
    })
  } catch (error) {
    return { error: getAuthApiErrorMessage(error) }
  }

  await deleteRouteObjects({
    route: "avatar",
    ownerId: session.user.id,
    headers: requestHeaders,
  })

  invalidateUserCache(session.user.id)
  return { success: true as const }
}
