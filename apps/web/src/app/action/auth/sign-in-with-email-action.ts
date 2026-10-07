"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { getAuthRedirectFromForm } from "@/app/(auth)/lib/auth-form-parse"
import { type AuthFormState } from "@/app/(auth)/lib/auth-form-state"
import { getFormString } from "@/components/form/form-parse"
import { toAbsoluteAppUrl } from "@repo/auth/app-origin"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

export async function signInWithEmailAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const redirectTo = getAuthRedirectFromForm(formData)

  try {
    await auth.api.signInEmail({
      headers: await headers(),
      body: {
        email: getFormString(formData, "email"),
        password: getFormString(formData, "password"),
        callbackURL: toAbsoluteAppUrl(redirectTo),
        rememberMe: true,
      },
    })
  } catch (error) {
    return { formError: getAuthApiErrorMessage(error) }
  }

  redirect(redirectTo)
}
