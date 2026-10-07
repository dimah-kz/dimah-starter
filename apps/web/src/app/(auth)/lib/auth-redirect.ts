import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"

export const DEFAULT_AUTH_REDIRECT = dashboardRoutes.home()

export function normalizeAuthRedirectTarget(
  value: string | null | undefined,
  fallback = DEFAULT_AUTH_REDIRECT
) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback
  }

  return value
}

export function withAuthRedirect(path: string, redirectTo: string) {
  if (redirectTo === DEFAULT_AUTH_REDIRECT) {
    return path
  }

  return `${path}?${new URLSearchParams({ redirect: redirectTo }).toString()}`
}
