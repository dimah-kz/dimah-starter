"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { revalidateTag, updateTag } from "next/cache"
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
    const { member } = await auth.api.acceptInvitation({
      headers: requestHeaders,
      body: { invitationId },
    })
    const { organizationId } = member

    try {
      await auth.api.setActiveOrganization({
        headers: requestHeaders,
        body: { organizationId },
      })
    } catch {
      // Membership is already created. The dashboard can still open.
    }

    updateTag(dashboardCacheTags.organizationMembersById(organizationId))
    updateTag(dashboardCacheTags.organizationInvitationsById(organizationId))
    // Member count in the admin organizations list.
    revalidateTag(dashboardCacheTags.adminOrganizationsPage(), "max")
  } catch (error) {
    const t = await getTranslations("auth.acceptInvitation")
    return {
      formError: getAuthApiErrorMessage(error) ?? t("unavailable"),
    }
  }

  redirect(dashboardRoutes.home())
}
