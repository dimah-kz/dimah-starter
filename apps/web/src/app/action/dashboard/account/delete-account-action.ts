"use server"

import { headers } from "next/headers"
import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { after } from "next/server"
import { authRoutes } from "@/app/(auth)/lib/auth-routes"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { getFormString } from "@/components/form/form-parse"
import { auth, getAuthApiErrorMessage } from "@repo/auth"
import { deleteOwnedObjects } from "@repo/storage"

type DeleteAccountResult = {
  success: false
  error?: string
}

/**
 * Deletes the signed-in user with the token from the confirmation mail, then
 * signs out. Better Auth refuses while the user is an organization's only owner.
 */
export async function deleteAccountAction(
  formData: FormData
): Promise<DeleteAccountResult> {
  const token = getFormString(formData, "token")
  const requestHeaders = await headers()
  const session = await auth.api.getSession({ headers: requestHeaders })

  if (!token || !session) {
    return { success: false }
  }

  const userId = session.user.id

  try {
    await auth.api.deleteUser({ headers: requestHeaders, body: { token } })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  // The avatar and any other files of the user go with them.
  after(() => deleteOwnedObjects("user", userId))

  revalidateTag(dashboardCacheTags.userProfileById(userId), "max")
  revalidateTag(dashboardCacheTags.adminUsersPage(), "max")
  redirect(`${authRoutes.login()}?notice=account-deleted`)
}
