export const loginPath = "/login"

/** Second sign-in step for accounts with two-factor authentication. */
export const twoFactorPath = "/two-factor"

export function acceptInvitationPath(invitationId: string) {
  return `/accept-invitation/${encodeURIComponent(invitationId)}`
}
