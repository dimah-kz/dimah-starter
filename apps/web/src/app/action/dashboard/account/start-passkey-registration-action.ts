"use server"

import { headers } from "next/headers"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

type StartPasskeyRegistrationResult =
  | {
      success: true
      options: Awaited<
        ReturnType<typeof auth.api.generatePasskeyRegistrationOptions>
      >
    }
  | { success: false; error?: string }

/**
 * First half of adding a passkey: WebAuthn options for the browser. Better
 * Auth keeps the challenge in a signed cookie for `addPasskeyAction`.
 */
export async function startPasskeyRegistrationAction(): Promise<StartPasskeyRegistrationResult> {
  try {
    const options = await auth.api.generatePasskeyRegistrationOptions({
      headers: await headers(),
    })
    return { success: true, options }
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }
}
