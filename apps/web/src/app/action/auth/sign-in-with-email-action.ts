"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { type AuthFormState } from "@/app/(auth)/lib/auth-form-state"
import {
  normalizeAuthRedirectTarget,
  withAuthRedirect,
} from "@/app/(auth)/lib/auth-redirect"
import { authRoutes } from "@/app/(auth)/lib/auth-routes"
import { getFormPassword, getFormString } from "@/components/form/form-parse"
import { toAbsoluteAppUrl } from "@repo/auth/app-origin"
import { auth, consumeRateLimit, getAuthApiErrorMessage } from "@repo/auth"

export async function signInWithEmailAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const redirectTo = normalizeAuthRedirectTarget(formData.get("redirectTo"))
  const email = getFormString(formData, "email")
  const requestHeaders = await headers()

  if (!(await consumeRateLimit("signIn", requestHeaders, email))) {
    const t = await getTranslations("auth.errors")
    return { formError: t("tooManyAttempts"), values: { email } }
  }

  let needsSecondFactor: boolean

  try {
    const result = await auth.api.signInEmail({
      headers: requestHeaders,
      body: {
        email,
        password: getFormPassword(formData, "password"),
        callbackURL: toAbsoluteAppUrl(redirectTo),
        rememberMe: true,
      },
    })
    // Two-factor accounts get a short-lived challenge cookie, not a session.
    needsSecondFactor = "twoFactorRedirect" in result
  } catch (error) {
    const t = await getTranslations("auth.errors")
    return {
      formError: getAuthApiErrorMessage(error) ?? t("unavailable"),
      values: { email },
    }
  }

  redirect(
    needsSecondFactor
      ? withAuthRedirect(authRoutes.twoFactor(), redirectTo)
      : redirectTo
  )
}
