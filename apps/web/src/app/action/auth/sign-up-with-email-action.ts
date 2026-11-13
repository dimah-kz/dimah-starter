"use server"

import { redirect } from "next/navigation"
import { revalidateTag } from "next/cache"
import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { type AuthFormState } from "@/app/(auth)/lib/auth-form-state"
import {
  normalizeAuthRedirectTarget,
  withAuthRedirect,
} from "@/app/(auth)/lib/auth-redirect"
import { authRoutes } from "@/app/(auth)/lib/auth-routes"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import {
  getFormPassword,
  getFormString,
  NAME_MAX_LENGTH,
} from "@/components/form/form-parse"
import { toAbsoluteAppUrl } from "@repo/auth/app-origin"
import { auth, consumeRateLimit, getAuthApiErrorMessage } from "@repo/auth"

export async function signUpWithEmailAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const redirectTo = normalizeAuthRedirectTarget(formData.get("redirectTo"))
  const values = {
    name: getFormString(formData, "name"),
    email: getFormString(formData, "email"),
  }
  const requestHeaders = await headers()

  // Better Auth accepts any string, including the empty one.
  if (!values.name || values.name.length > NAME_MAX_LENGTH) {
    const t = await getTranslations("common.errors")
    return { formError: t("nameInvalid", { max: NAME_MAX_LENGTH }), values }
  }

  if (!(await consumeRateLimit("signUp", requestHeaders))) {
    const t = await getTranslations("auth.errors")
    return { formError: t("tooManyAttempts"), values }
  }

  let signedIn: boolean

  try {
    const result = await auth.api.signUpEmail({
      headers: requestHeaders,
      body: {
        ...values,
        password: getFormPassword(formData, "password"),
        callbackURL: toAbsoluteAppUrl(redirectTo),
      },
    })
    signedIn = Boolean(result.token)
  } catch (error) {
    const t = await getTranslations("auth.errors")
    return {
      formError: getAuthApiErrorMessage(error) ?? t("unavailable"),
      values,
    }
  }

  // A new row in the admin users list.
  revalidateTag(dashboardCacheTags.adminUsersPage(), "max")

  redirect(
    signedIn
      ? redirectTo
      : withAuthRedirect(authRoutes.verifyEmail(), redirectTo)
  )
}
