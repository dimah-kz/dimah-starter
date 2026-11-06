import { APIError } from "better-auth"

/**
 * User-facing text for a failed `auth.api` call: the Better Auth message
 * (translated by the i18n plugin), or `undefined` so the caller shows its own
 * copy. Any other error is logged and never shown — it may carry SQL or
 * driver internals.
 */
export function getAuthApiErrorMessage(error: unknown): string | undefined {
  if (error instanceof APIError) return error.message || undefined
  console.error(error)
  return undefined
}
