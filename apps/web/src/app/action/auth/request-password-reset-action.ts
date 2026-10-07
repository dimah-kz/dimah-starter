"use server"

import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { getAuthRedirectFromForm } from "@/app/(auth)/lib/auth-form-parse"
import { type AuthFormState } from "@/app/(auth)/lib/auth-form-state"
import { authRoutes } from "@/app/(auth)/lib/auth-routes"
import { withAuthRedirect } from "@/app/(auth)/lib/auth-redirect"
import { getFormString } from "@/components/form/form-parse"
import { toAbsoluteAppUrl } from "@repo/auth/app-origin"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

export async function requestPasswordResetAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const redirectTo = getAuthRedirectFromForm(formData)

  try {
    await auth.api.requestPasswordReset({
      headers: await headers(),
      body: {
        email: getFormString(formData, "email"),
        redirectTo: toAbsoluteAppUrl(
          withAuthRedirect(authRoutes.resetPassword(), redirectTo)
        ),
      },
    })
  } catch (error) {
    return { formError: getAuthApiErrorMessage(error) }
  }

  const t = await getTranslations("auth.forgotPassword")
  return { formMessage: t("sent") }
}
