"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { getAuthRedirectFromForm } from "@/app/(auth)/lib/auth-form-parse"
import { type AuthFormState } from "@/app/(auth)/lib/auth-form-state"
import { authRoutes } from "@/app/(auth)/lib/auth-routes"
import { withAuthRedirect } from "@/app/(auth)/lib/auth-redirect"
import { getFormString } from "@/components/form/form-parse"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

export async function resetPasswordAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const redirectTo = getAuthRedirectFromForm(formData)
  const newPassword = getFormString(formData, "password")
  const confirmPassword = getFormString(formData, "confirmPassword")

  if (newPassword !== confirmPassword) {
    const t = await getTranslations("auth.resetPassword")
    return { formError: t("mismatch") }
  }

  try {
    await auth.api.resetPassword({
      headers: await headers(),
      body: {
        newPassword,
        token: getFormString(formData, "token"),
      },
    })
  } catch (error) {
    return { formError: getAuthApiErrorMessage(error) }
  }

  const params = new URLSearchParams({ notice: "password-reset" })
  const loginPath = withAuthRedirect(authRoutes.login(), redirectTo)
  const join = loginPath.includes("?") ? "&" : "?"
  redirect(`${loginPath}${join}${params.toString()}`)
}
