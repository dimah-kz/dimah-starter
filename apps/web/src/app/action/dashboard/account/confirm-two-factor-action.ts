"use server"

import { headers } from "next/headers"
import { refresh } from "next/cache"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

type ConfirmTwoFactorResult = {
  success: boolean
  error?: string
}

/**
 * Last step of the setup: a valid code from the authenticator app turns
 * two-factor on. Better Auth replaces the session cookie in this response.
 */
export async function confirmTwoFactorAction(
  code: string
): Promise<ConfirmTwoFactorResult> {
  try {
    await auth.api.verifyTOTP({
      headers: await headers(),
      body: { code: code.replace(/\s/g, "") },
    })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  // Two-factor state is read per request, not from a tag.
  refresh()
  return { success: true }
}
