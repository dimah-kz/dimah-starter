"use server"

import { headers } from "next/headers"
import { refresh } from "next/cache"
import { getTranslations } from "next-intl/server"
import { getFormPassword } from "@/components/form/form-parse"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

type SetPasswordResult = {
  success: boolean
  error?: string
}

/** Adds a password to an account that signs in with Google only. */
export async function setPasswordAction(
  formData: FormData
): Promise<SetPasswordResult> {
  const newPassword = getFormPassword(formData, "newPassword")

  if (newPassword !== getFormPassword(formData, "confirmPassword")) {
    const t = await getTranslations("account.password")
    return { success: false, error: t("mismatch") }
  }

  try {
    await auth.api.setPassword({
      headers: await headers(),
      body: { newPassword },
    })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  // Sign-in methods are read per request, not from a tag.
  refresh()
  return { success: true }
}
