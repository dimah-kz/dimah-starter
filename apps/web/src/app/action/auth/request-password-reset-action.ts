"use server"

import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { type AuthFormState } from "@/app/(auth)/lib/auth-form-state"
import { authRoutes } from "@/app/(auth)/lib/auth-routes"
import {
  normalizeAuthRedirectTarget,
  withAuthRedirect,
} from "@/app/(auth)/lib/auth-redirect"
import { getFormString } from "@/components/form/form-parse"
import { toAbsoluteAppUrl } from "@repo/auth/app-origin"
import { auth, consumeRateLimit, getAuthApiErrorMessage } from "@repo/auth"

export async function requestPasswordResetAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const redirectTo = normalizeAuthRedirectTarget(formData.get("redirectTo"))
  const email = getFormString(formData, "email")
  const requestHeaders = await headers()

  if (!(await consumeRateLimit("passwordReset", requestHeaders, email))) {
    const t = await getTranslations("auth.errors")
    return { formError: t("tooManyAttempts"), values: { email } }
  }

  try {
    await auth.api.requestPasswordReset({
      headers: requestHeaders,
      body: {
        email,
        redirectTo: toAbsoluteAppUrl(
          withAuthRedirect(authRoutes.resetPassword(), redirectTo)
        ),
      },
    })
  } catch (error) {
    const t = await getTranslations("auth.errors")
    return {
      formError: getAuthApiErrorMessage(error) ?? t("unavailable"),
      values: { email },
    }
  }

  const t = await getTranslations("auth.forgotPassword")
  return { formMessage: t("sent"), values: { email } }
}
