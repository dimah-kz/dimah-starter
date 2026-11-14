"use server"

import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { auth, consumeRateLimit, getAuthApiErrorMessage } from "@repo/auth"

type StartPasskeySignInResult =
  | {
      success: true
      options: Awaited<
        ReturnType<typeof auth.api.generatePasskeyAuthenticationOptions>
      >
    }
  | { success: false; error?: string }

/**
 * First half of passkey sign-in: WebAuthn options for the browser. Better
 * Auth keeps the challenge in a signed cookie for `signInWithPasskeyAction`.
 */
export async function startPasskeySignInAction(): Promise<StartPasskeySignInResult> {
  const requestHeaders = await headers()

  if (!(await consumeRateLimit("passkeySignIn", requestHeaders))) {
    const t = await getTranslations("auth.errors")
    return { success: false, error: t("tooManyAttempts") }
  }

  try {
    const options = await auth.api.generatePasskeyAuthenticationOptions({
      headers: requestHeaders,
    })
    return { success: true, options }
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }
}
