"use server"

import { headers } from "next/headers"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

type EnableTwoFactorResult =
  | { success: true; totpURI: string; backupCodes: string[] }
  | { success: false; error?: string }

/**
 * First step of the setup: checks the password and creates an unverified
 * secret. Two-factor turns on only once `confirmTwoFactorAction` accepts a
 * code from the authenticator app.
 */
export async function enableTwoFactorAction(
  password: string
): Promise<EnableTwoFactorResult> {
  try {
    const result = await auth.api.enableTwoFactor({
      headers: await headers(),
      body: { password, method: "totp" },
    })

    if (!("totpURI" in result) || !result.totpURI || !result.backupCodes) {
      return { success: false }
    }

    return {
      success: true,
      totpURI: result.totpURI,
      backupCodes: result.backupCodes,
    }
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }
}
