export const loginPath = "/login"

/** Second sign-in step for accounts with two-factor authentication. */
export const twoFactorPath = "/two-factor"

/** Page the account-deletion mail links to, with `?token=`. */
export const accountDeletionPath = "/dashboard/account/delete"

export function acceptInvitationPath(invitationId: string) {
  return `/accept-invitation/${encodeURIComponent(invitationId)}`
}
