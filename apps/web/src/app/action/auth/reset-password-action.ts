"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { type AuthFormState } from "@/app/(auth)/lib/auth-form-state"
import { authRoutes } from "@/app/(auth)/lib/auth-routes"
import {
  normalizeAuthRedirectTarget,
  withAuthRedirect,
} from "@/app/(auth)/lib/auth-redirect"
import { getFormPassword, getFormString } from "@/components/form/form-parse"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

export async function resetPasswordAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const redirectTo = normalizeAuthRedirectTarget(formData.get("redirectTo"))
  const newPassword = getFormPassword(formData, "password")
  const confirmPassword = getFormPassword(formData, "confirmPassword")

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
    const t = await getTranslations("auth.errors")
    return { formError: getAuthApiErrorMessage(error) ?? t("unavailable") }
  }

  redirect(
    withAuthRedirect(authRoutes.login(), redirectTo, {
      notice: "password-reset",
    })
  )
}
