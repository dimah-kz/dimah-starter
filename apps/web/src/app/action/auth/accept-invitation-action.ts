"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { updateTag } from "next/cache"
import { getTranslations } from "next-intl/server"
import { type AuthFormState } from "@/app/(auth)/lib/auth-form-state"
import { getFormString } from "@/components/form/form-parse"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

export async function acceptInvitationAction(
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

    await auth.api.acceptInvitation({
      headers: requestHeaders,
      body: { invitationId },
    })

    try {
      await auth.api.setActiveOrganization({
        headers: requestHeaders,
        body: { organizationId: invitation.organizationId },
      })
    } catch {
      // Membership is already created. The dashboard can still open.
    }

    const session = await auth.api.getSession({ headers: requestHeaders })
    if (session) {
      updateTag(dashboardCacheTags.sidebarConfigByUser(session.user.id))
    }

    updateTag(
      dashboardCacheTags.organizationMembersById(invitation.organizationId)
    )
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
