"use server"

import { redirect } from "next/navigation"
import { updateTag } from "next/cache"
import { headers } from "next/headers"
import { getTranslations } from "next-intl/server"
import { type AuthFormState } from "@/app/(auth)/lib/auth-form-state"
import { getFormString } from "@/components/form/form-parse"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

export async function rejectInvitationAction(
  _prevState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const invitationId = getFormString(formData, "invitationId")
  const requestHeaders = await headers()

  try {
    const invitation = await auth.api.getInvitation({
      headers: requestHeaders,
      query: { id: invitationId },
    })

    await auth.api.rejectInvitation({
      headers: requestHeaders,
      body: { invitationId },
    })

    updateTag(
      dashboardCacheTags.organizationInvitationsById(invitation.organizationId)
    )
  } catch (error) {
    const t = await getTranslations("auth.acceptInvitation")
    return {
      formError: getAuthApiErrorMessage(error) || t("unavailable"),
    }
  }

  redirect(dashboardRoutes.home())
}
