"use server"

import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { setDashboardActiveOrganization } from "@/app/dashboard/lib/dashboard-session"
import { headers } from "next/headers"
import { updateTag } from "next/cache"
import { getTranslations } from "next-intl/server"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

type CreateOrganizationInput = {
  name: string
}

type CreateOrganizationResult = {
  success: boolean
  error?: string
}

function randomSlugSuffix(length = 8) {
  return crypto.randomUUID().replace(/-/g, "").slice(0, length)
}

function slugifyOrganizationName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function buildOrganizationSlug(name: string, suffix?: string) {
  const base = slugifyOrganizationName(name)
  const slugBase = base || `org-${randomSlugSuffix()}`
  return suffix ? `${slugBase}-${suffix}` : slugBase
}

function isDuplicateSlugError(error: unknown) {
  const message = getAuthApiErrorMessage(error).toLowerCase()
  return message.includes("slug") && message.includes("exist")
}

async function createOrganizationWithSlug(name: string, slug: string) {
  return auth.api.createOrganization({
    headers: await headers(),
    body: { name, slug },
  })
}

export async function createOrganizationAction(
  input: CreateOrganizationInput
): Promise<CreateOrganizationResult> {
  const name = input.name.trim()
  let organization: Awaited<ReturnType<typeof createOrganizationWithSlug>>

  try {
    organization = await createOrganizationWithSlug(
      name,
      buildOrganizationSlug(name)
    )
  } catch (error) {
    if (!isDuplicateSlugError(error)) {
      return { success: false, error: getAuthApiErrorMessage(error) }
    }

    try {
      organization = await createOrganizationWithSlug(
        name,
        buildOrganizationSlug(name, randomSlugSuffix())
      )
    } catch (retryError) {
      return { success: false, error: getAuthApiErrorMessage(retryError) }
    }
  }

  const organizationId = organization?.id

  if (!organizationId) {
    const t = await getTranslations("dashboard.nav.organizationSwitcher")
    return { success: false, error: t("organizationCreateFailed") }
  }

  await setDashboardActiveOrganization(organizationId)

  updateTag(dashboardCacheTags.adminOrganizationsPage())

  const session = await auth.api.getSession({ headers: await headers() })
  if (session) {
    updateTag(dashboardCacheTags.sidebarConfigByUser(session.user.id))
  }

  return { success: true }
}
