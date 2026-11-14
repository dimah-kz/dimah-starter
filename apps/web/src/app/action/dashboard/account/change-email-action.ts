"use server"

import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"
import { getFormString } from "@/components/form/form-parse"
import { toAbsoluteAppUrl } from "@repo/auth/app-origin"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

type ChangeEmailResult = {
  success: boolean
  error?: string
}

const EMAIL_MAX_LENGTH = 254
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Starts an email change. Better Auth mails the current address to confirm,
 * then the new one to verify; the email changes when that link is opened.
 */
export async function changeEmailAction(
  formData: FormData
): Promise<ChangeEmailResult> {
  const newEmail = getFormString(formData, "email").toLowerCase()
  const t = await getTranslations("account.profile.email")

  if (newEmail.length > EMAIL_MAX_LENGTH || !EMAIL_PATTERN.test(newEmail)) {
    return { success: false, error: t("invalid") }
  }

  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })

  if (session?.user.email.toLowerCase() === newEmail) {
    return { success: false, error: t("same") }
  }

  try {
    await auth.api.changeEmail({
      headers: requestHeaders,
      body: {
        newEmail,
        callbackURL: toAbsoluteAppUrl(dashboardRoutes.accountProfile()),
      },
    })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  // Nothing changes until the links are opened, so there is no cache to expire.
  return { success: true }
}
