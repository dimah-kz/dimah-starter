"use server"

import { headers } from "next/headers"
import { refresh } from "next/cache"
import type { RegistrationResponseJSON } from "@simplewebauthn/browser"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

type AddPasskeyResult = {
  success: boolean
  error?: string
}

/**
 * Second half of adding a passkey: Better Auth checks the browser's response
 * against the challenge from `startPasskeyRegistrationAction` and stores it.
 */
export async function addPasskeyAction(
  response: RegistrationResponseJSON
): Promise<AddPasskeyResult> {
  try {
    await auth.api.verifyPasskeyRegistration({
      headers: await headers(),
      body: { response },
    })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  // Passkeys are read per request, not from a tag.
  refresh()
  return { success: true }
}
