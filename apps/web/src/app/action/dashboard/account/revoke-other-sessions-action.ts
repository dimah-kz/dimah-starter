"use server"

import { headers } from "next/headers"
import { refresh } from "next/cache"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

type RevokeOtherSessionsResult = {
  success: boolean
  error?: string
}

export async function revokeOtherSessionsAction(): Promise<RevokeOtherSessionsResult> {
  try {
    await auth.api.revokeOtherSessions({ headers: await headers() })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  // The session list is read per request, not from a tag.
  refresh()
  return { success: true }
}
