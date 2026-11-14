import { APIError } from "better-auth"

/**
 * User-facing text for a failed `auth.api` call: the Better Auth message
 * (translated by the i18n plugin), or `undefined` so the caller shows its own
 * copy. Any other error is logged and never shown — it may carry SQL or
 * driver internals.
 */
export function getAuthApiErrorMessage(error: unknown): string | undefined {
  if (isAuthApiError(error)) return error.message || undefined
  console.error(error)
  return undefined
}

/** A refusal from Better Auth (no session, not a member, …), not a failure. */
export function isAuthApiError(error: unknown): error is APIError {
  return error instanceof APIError
}
