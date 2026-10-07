import { cache } from "react"
import { io } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { authRoutes } from "@/app/(auth)/lib/auth-routes"
import { normalizeAuthRedirectTarget } from "@/app/(auth)/lib/auth-redirect"
import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"
import { auth } from "@repo/auth"

/**
 * Better Auth checks expiry with `Date.now()`. Partial Prefetching rejects that
 * clock read until the Dynamic stage, so render-time auth waits on `io()` first.
 */
export async function dashboardAuthHeaders() {
  await io()
  return headers()
}

/** Request-scoped session read. Not Next `'use cache'` — never store session in the data cache. */
const getDashboardSession = cache(async () => {
  return auth.api.getSession({ headers: await dashboardAuthHeaders() })
})

/** Redirects unauthenticated visitors to login; returns the session otherwise. */
export async function requireDashboardSession() {
  const session = await getDashboardSession()

  if (!session?.user) {
    const params = new URLSearchParams({
      redirect: normalizeAuthRedirectTarget(dashboardRoutes.home()),
    })
    redirect(`${authRoutes.login()}?${params.toString()}`)
  }

  return session
}

/** Organizations the signed-in user belongs to (for switcher / nav). */
export const listDashboardOrganizations = cache(async () => {
  return auth.api.listOrganizations({ headers: await dashboardAuthHeaders() })
})

/** Set session active org via Better Auth — authorization enforced by the API. */
export async function setDashboardActiveOrganization(organizationId: string) {
  await auth.api.setActiveOrganization({
    headers: await dashboardAuthHeaders(),
    body: { organizationId },
  })
}

/** Unset active org — personal account context. */
export async function clearDashboardActiveOrganization() {
  await auth.api.setActiveOrganization({
    headers: await dashboardAuthHeaders(),
    body: { organizationId: null },
  })
}

/**
 * Session active org when the user is still a member. `null` means personal
 * account (explicit user choice). Only heals stale ids — never auto-selects
 * the first membership when active org is intentionally unset.
 */
export const resolveDashboardActiveOrganizationId = cache(async () => {
  const session = await getDashboardSession()
  if (!session) {
    return null
  }

  const activeOrganizationId = session.session.activeOrganizationId ?? null

  if (activeOrganizationId === null) {
    return null
  }

  const organizations = await listDashboardOrganizations()
  const membershipIds = new Set(
    organizations.map((organization) => organization.id)
  )

  if (membershipIds.has(activeOrganizationId)) {
    return activeOrganizationId
  }

  const firstOrganization = organizations[0]

  if (firstOrganization?.id) {
    await setDashboardActiveOrganization(firstOrganization.id)
    return firstOrganization.id
  }

  await clearDashboardActiveOrganization()
  return null
})
