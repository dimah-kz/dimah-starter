"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { getAuthRedirectFromForm } from "@/app/(auth)/lib/auth-form-parse"
import { withAuthRedirect } from "@/app/(auth)/lib/auth-redirect"
import { authRoutes } from "@/app/(auth)/lib/auth-routes"
import { type AuthFormState } from "@/app/(auth)/lib/auth-form-state"
import { getFormString } from "@/components/form/form-parse"
import { toAbsoluteAppUrl } from "@repo/auth/app-origin"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

export async function signInWithGoogleAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const redirectTo = getAuthRedirectFromForm(formData)
  const returnPath = authReturnPath(getFormString(formData, "returnPath"))
  const result = await startGoogleSignIn(redirectTo, returnPath)

  if (!result.ok) {
    return { formError: result.formError }
  }

  redirect(result.url)
}

function authReturnPath(value: string) {
  if (value === authRoutes.signup()) {
    return authRoutes.signup()
  }

  return authRoutes.login()
}

async function startGoogleSignIn(redirectTo: string, returnPath: string) {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim()
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()

  if (!clientId || !clientSecret) {
    const t = await getTranslations("auth.social")
    return { ok: false as const, formError: t("googleUnavailable") }
  }

  try {
    const result = await auth.api.signInSocial({
      headers: await headers(),
      body: {
        provider: "google",
        callbackURL: toAbsoluteAppUrl(redirectTo),
        errorCallbackURL: toAbsoluteAppUrl(
          withAuthRedirect(returnPath, redirectTo)
        ),
        disableRedirect: true,
      },
    })

    if (!result.url) {
      const t = await getTranslations("auth.social")
      return { ok: false as const, formError: t("googleError") }
    }

    return { ok: true as const, url: result.url }
  } catch (error) {
    return { ok: false as const, formError: getAuthApiErrorMessage(error) }
  }
}
