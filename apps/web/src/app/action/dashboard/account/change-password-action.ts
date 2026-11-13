"use server"

import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { getFormPassword } from "@/components/form/form-parse"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

type ChangePasswordResult = {
  success: boolean
  error?: string
}

export async function changePasswordAction(
  formData: FormData
): Promise<ChangePasswordResult> {
  const currentPassword = getFormPassword(formData, "currentPassword")
  const newPassword = getFormPassword(formData, "newPassword")

  if (newPassword !== getFormPassword(formData, "confirmPassword")) {
    const t = await getTranslations("account.password")
    return { success: false, error: t("mismatch") }
  }

  try {
    await auth.api.changePassword({
      headers: await headers(),
      // Like a reset: a stolen session must not outlive the old password.
      body: { currentPassword, newPassword, revokeOtherSessions: true },
    })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  return { success: true }
}
