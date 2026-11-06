import { cache } from "react"
import { io } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { authRoutes } from "@/app/(auth)/lib/auth-routes"
import { withAuthRedirect } from "@/app/(auth)/lib/auth-redirect"
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
    redirect(withAuthRedirect(authRoutes.login(), dashboardRoutes.home()))
  }

  return session
}

/** Organizations the signed-in user belongs to (for switcher / nav). */
export const listDashboardOrganizations = cache(async () => {
  return auth.api.listOrganizations({ headers: await dashboardAuthHeaders() })
})

/**
 * Session active org when the user is still a member. `null` means personal
 * account. A stale id (the user left, or the org was deleted) reads as
 * personal — render never writes; switching is the Server Action's job.
 */
export const resolveDashboardActiveOrganizationId = cache(async () => {
  const session = await getDashboardSession()
  const activeOrganizationId = session?.session.activeOrganizationId

  if (!activeOrganizationId) {
    return null
  }

  const organizations = await listDashboardOrganizations()

  return organizations.some(({ id }) => id === activeOrganizationId)
    ? activeOrganizationId
    : null
})

/** Platform admin area (`/dashboard/admin`). */
export const canAccessPlatformAdmin = cache(async () => {
  const { success } = await auth.api.userHasPermission({
    headers: await dashboardAuthHeaders(),
    body: { permissions: { user: ["list"] } },
  })
  return success
})

/** Organization manage area (`/dashboard/manage`) for `organizationId`. */
export const canManageOrganization = cache(async (organizationId: string) => {
  const { success } = await auth.api.hasPermission({
    headers: await dashboardAuthHeaders(),
    body: { organizationId, permissions: { member: ["update"] } },
  })
  return success
})

/**
 * Gate for admin pages **and** their data reads. A layout check alone does not
 * stop a page from rendering into the RSC payload, so every read calls this.
 */
export async function requirePlatformAdmin() {
  const session = await requireDashboardSession()

  if (!(await canAccessPlatformAdmin())) {
    redirect(dashboardRoutes.home())
  }

  return session
}

/**
 * Gate for organization manage pages and their data reads. Returns the active
 * organization the signed-in user may manage.
 */
export async function requireOrganizationManager() {
  const session = await requireDashboardSession()
  const organizationId = await resolveDashboardActiveOrganizationId()

  if (!organizationId || !(await canManageOrganization(organizationId))) {
    redirect(dashboardRoutes.home())
  }

  return { session, organizationId }
}
