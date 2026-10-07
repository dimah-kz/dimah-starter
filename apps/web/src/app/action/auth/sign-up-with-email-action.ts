"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { getAuthRedirectFromForm } from "@/app/(auth)/lib/auth-form-parse"
import { withAuthRedirect } from "@/app/(auth)/lib/auth-redirect"
import { authRoutes } from "@/app/(auth)/lib/auth-routes"
import { type AuthFormState } from "@/app/(auth)/lib/auth-form-state"
import { getFormString } from "@/components/form/form-parse"
import { toAbsoluteAppUrl } from "@repo/auth/app-origin"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

export async function signUpWithEmailAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const redirectTo = getAuthRedirectFromForm(formData)
  const result = await signUp(formData, redirectTo)

  if (!result.ok) {
    return { formError: result.formError }
  }

  if (!result.signedIn) {
    redirect(withAuthRedirect(authRoutes.verifyEmail(), redirectTo))
  }

  redirect(redirectTo)
}

async function signUp(formData: FormData, redirectTo: string) {
  try {
    const result = await auth.api.signUpEmail({
      headers: await headers(),
      body: {
        name: getFormString(formData, "name"),
        email: getFormString(formData, "email"),
        password: getFormString(formData, "password"),
        callbackURL: toAbsoluteAppUrl(redirectTo),
      },
    })

    return { ok: true as const, signedIn: Boolean(result.token) }
  } catch (error) {
    return { ok: false as const, formError: getAuthApiErrorMessage(error) }
  }
}
