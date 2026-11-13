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
import { getFormString } from "@/components/form/form-parse"
import { toAbsoluteAppUrl } from "@repo/auth/app-origin"
import { auth, consumeRateLimit, getAuthApiErrorMessage } from "@repo/auth"

export async function signInWithGoogleAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const redirectTo = normalizeAuthRedirectTarget(formData.get("redirectTo"))
  const returnPath =
    getFormString(formData, "returnPath") === authRoutes.signup()
      ? authRoutes.signup()
      : authRoutes.login()
  const requestHeaders = await headers()
  let url: string | undefined

  if (!(await consumeRateLimit("socialSignIn", requestHeaders))) {
    const t = await getTranslations("auth.errors")
    return { formError: t("tooManyAttempts") }
  }

  try {
    const result = await auth.api.signInSocial({
      headers: requestHeaders,
      body: {
        provider: "google",
        callbackURL: toAbsoluteAppUrl(redirectTo),
        errorCallbackURL: toAbsoluteAppUrl(
          withAuthRedirect(returnPath, redirectTo)
        ),
        disableRedirect: true,
      },
    })
    url = result.url
  } catch (error) {
    const t = await getTranslations("auth.social")
    return { formError: getAuthApiErrorMessage(error) ?? t("googleError") }
  }

  if (!url) {
    const t = await getTranslations("auth.social")
    return { formError: t("googleError") }
  }

  redirect(url)
}
