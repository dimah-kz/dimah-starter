"use server"

import { headers } from "next/headers"
import { revalidateTag } from "next/cache"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

type CreateOrganizationInput = {
  name: string
}

type CreateOrganizationResult = {
  success: boolean
  error?: string
}

function toSlug(name: string, suffix?: string) {
  const base =
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "org"

  return suffix ? `${base}-${suffix}` : base
}

/** Better Auth's code for a taken slug (its message is translated). */
function isSlugTaken(error: unknown) {
  return (
    error instanceof Error &&
    "body" in error &&
    (error.body as { code?: string } | undefined)?.code ===
      "ORGANIZATION_ALREADY_EXISTS"
  )
}

/** Creates the organization and switches to it. */
export async function createOrganizationAction(
  input: CreateOrganizationInput
): Promise<CreateOrganizationResult> {
  const requestHeaders = await headers()
  const name = input.name.trim()
  const create = (slug: string) =>
    auth.api.createOrganization({
      headers: requestHeaders,
      body: { name, slug },
    })

  try {
    const organization = await create(toSlug(name)).catch((error: unknown) => {
      if (!isSlugTaken(error)) throw error
      return create(toSlug(name, crypto.randomUUID().slice(0, 8)))
    })

    // Better Auth sets the active org in the database only; this also
    // refreshes the session cookie.
    await auth.api.setActiveOrganization({
      headers: requestHeaders,
      body: { organizationId: organization.id },
    })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  revalidateTag(dashboardCacheTags.adminOrganizationsPage(), "max")
  return { success: true }
}
