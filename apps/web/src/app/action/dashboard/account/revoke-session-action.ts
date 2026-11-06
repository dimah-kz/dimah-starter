"use server"

import { headers } from "next/headers"
import { refresh } from "next/cache"
import { getTranslations } from "next-intl/server"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

type RevokeSessionResult = {
  success: boolean
  error?: string
}

export async function revokeSessionAction(
  sessionId: string
): Promise<RevokeSessionResult> {
  const requestHeaders = await headers()

  try {
    const [current, sessions] = await Promise.all([
      auth.api.getSession({ headers: requestHeaders }),
      auth.api.listSessions({ headers: requestHeaders }),
    ])
    const target = sessions.find((session) => session.id === sessionId)

    // The current device signs out from the user menu instead.
    if (!current || !target || target.id === current.session.id) {
      const t = await getTranslations("account.sessions")
      return { success: false, error: t("revokeFailed") }
    }

    await auth.api.revokeSession({
      headers: requestHeaders,
      body: { token: target.token },
    })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  // The session list is read per request, not from a tag.
  refresh()
  return { success: true }
}
