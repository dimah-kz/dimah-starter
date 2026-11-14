"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { accountConnectionProviders } from "@/app/dashboard/account/lib/get-account-security"
import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"
import { getFormString } from "@/components/form/form-parse"
import { toAbsoluteAppUrl } from "@repo/auth/app-origin"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

export type LinkSocialAccountState = {
  failed?: boolean
  /** Better Auth's translated message; the UI has its own otherwise. */
  error?: string
}

/**
 * Sends the browser to the provider. Better Auth's OAuth callback links the
 * account and returns to the security page, with `?error=` when it failed.
 */
export async function linkSocialAccountAction(
  _prevState: LinkSocialAccountState,
  formData: FormData
): Promise<LinkSocialAccountState> {
  const provider = accountConnectionProviders.find(
    (id) => id === getFormString(formData, "provider")
  )
  const returnUrl = toAbsoluteAppUrl(dashboardRoutes.accountSecurity())
  let url: string | undefined

  if (provider) {
    try {
      const result = await auth.api.linkSocialAccount({
        headers: await headers(),
        body: {
          provider,
          callbackURL: returnUrl,
          errorCallbackURL: returnUrl,
          disableRedirect: true,
        },
      })
      url = result.url
    } catch (error) {
      return { failed: true, error: getAuthApiErrorMessage(error) }
    }
  }

  if (!url) {
    return { failed: true }
  }

  redirect(url)
}
