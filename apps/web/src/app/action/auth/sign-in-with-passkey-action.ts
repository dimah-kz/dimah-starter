"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import type { AuthenticationResponseJSON } from "@simplewebauthn/browser"
import { normalizeAuthRedirectTarget } from "@/app/(auth)/lib/auth-redirect"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

type SignInWithPasskeyResult = {
  success: false
  error?: string
}

/**
 * Second half of passkey sign-in: Better Auth checks the browser's response
 * against the challenge from `startPasskeySignInAction` and sets the session.
 * The challenge works once, so its rate limit covers this call too.
 */
export async function signInWithPasskeyAction(
  response: AuthenticationResponseJSON,
  redirectTo: string
): Promise<SignInWithPasskeyResult> {
  try {
    await auth.api.verifyPasskeyAuthentication({
      headers: await headers(),
      body: { response },
    })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  redirect(normalizeAuthRedirectTarget(redirectTo))
}
