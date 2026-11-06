import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"

export const DEFAULT_AUTH_REDIRECT = dashboardRoutes.home()

/** Resolves relative targets only; any other origin means the value left the app. */
const PLACEHOLDER_ORIGIN = "http://localhost"

/**
 * Same-origin path from a `redirect` search param or `redirectTo` form field.
 * Anything else (missing, repeated, a file, an absolute URL) is `fallback`.
 * Browsers read `\` as `/` and drop tabs and newlines, so `/\evil.com` and
 * `/\t/evil.com` resolve off-site — the origin check catches them.
 */
export function normalizeAuthRedirectTarget(
  value: unknown,
  fallback = DEFAULT_AUTH_REDIRECT
) {
  if (typeof value !== "string" || !value.startsWith("/")) {
    return fallback
  }

  try {
    const url = new URL(value, PLACEHOLDER_ORIGIN)

    return url.origin === PLACEHOLDER_ORIGIN
      ? url.pathname + url.search + url.hash
      : fallback
  } catch {
    return fallback
  }
}

/** `path` with `redirect` (omitted when it is the default) and any extra params. */
export function withAuthRedirect(
  path: string,
  redirectTo: string,
  params: Record<string, string> = {}
) {
  const query = new URLSearchParams(
    redirectTo === DEFAULT_AUTH_REDIRECT
      ? params
      : { redirect: redirectTo, ...params }
  ).toString()

  return query ? `${path}?${query}` : path
}
