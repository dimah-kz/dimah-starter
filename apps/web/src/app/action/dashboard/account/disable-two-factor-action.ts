"use server"

import { headers } from "next/headers"
import { refresh } from "next/cache"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

type DisableTwoFactorResult = {
  success: boolean
  error?: string
}

export async function disableTwoFactorAction(
  password: string
): Promise<DisableTwoFactorResult> {
  try {
    await auth.api.disableTwoFactor({
      headers: await headers(),
      body: { password },
    })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  // Two-factor state is read per request, not from a tag.
  refresh()
  return { success: true }
}
