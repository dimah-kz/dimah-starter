"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { type AuthFormState } from "@/app/(auth)/lib/auth-form-state"
import { normalizeAuthRedirectTarget } from "@/app/(auth)/lib/auth-redirect"
import { getFormString } from "@/components/form/form-parse"
import { auth, consumeRateLimit, getAuthApiErrorMessage } from "@repo/auth"

/**
 * Second sign-in step. The challenge cookie from the password step names the
 * user; a valid authenticator or backup code turns it into a session.
 */
export async function verifyTwoFactorAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const redirectTo = normalizeAuthRedirectTarget(formData.get("redirectTo"))
  const code = getFormString(formData, "code").replace(/\s/g, "")
  const body = { code, trustDevice: formData.get("trustDevice") === "on" }
  const requestHeaders = await headers()
  const t = await getTranslations("auth")

  if (!code) {
    return { formError: t("twoFactor.invalid") }
  }

  if (!(await consumeRateLimit("twoFactor", requestHeaders))) {
    return { formError: t("errors.tooManyAttempts") }
  }

  try {
    if (getFormString(formData, "method") === "backup") {
      await auth.api.verifyBackupCode({ headers: requestHeaders, body })
    } else {
      await auth.api.verifyTOTP({ headers: requestHeaders, body })
    }
  } catch (error) {
    return {
      formError: getAuthApiErrorMessage(error) ?? t("twoFactor.invalid"),
    }
  }

  redirect(redirectTo)
}
