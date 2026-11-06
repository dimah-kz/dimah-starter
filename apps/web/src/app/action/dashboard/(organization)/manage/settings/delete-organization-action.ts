"use server"

import { headers } from "next/headers"
import { revalidateTag, updateTag } from "next/cache"
import { after } from "next/server"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { auth, getAuthApiErrorMessage } from "@repo/auth"
import { deleteOwnedObjects } from "@repo/storage"

type DeleteOrganizationInput = {
  organizationId: string
}

type DeleteOrganizationResult = {
  success: boolean
  error?: string
}

/** Deletes the organization and switches back to the personal account. */
export async function deleteOrganizationAction(
  input: DeleteOrganizationInput
): Promise<DeleteOrganizationResult> {
  const requestHeaders = await headers()
  const { organizationId } = input

  try {
    await auth.api.deleteOrganization({
      headers: requestHeaders,
      body: { organizationId },
    })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  // Better Auth clears the active org in the database only; this refreshes
  // the session cookie too. If it fails, render already reads the stale id as
  // the personal account.
  await auth.api
    .setActiveOrganization({
      headers: requestHeaders,
      body: { organizationId: null },
    })
    .catch((error: unknown) => console.error(error))

  // The logo and any other files of the organization go with it.
  after(() => deleteOwnedObjects("organization", organizationId))

  updateTag(dashboardCacheTags.organizationBrandingById(organizationId))
  updateTag(dashboardCacheTags.organizationMembersById(organizationId))
  updateTag(dashboardCacheTags.organizationInvitationsById(organizationId))
  revalidateTag(dashboardCacheTags.adminOrganizationsPage(), "max")
  return { success: true }
}
