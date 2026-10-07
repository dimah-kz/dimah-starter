export const loginPath = "/login"

export function acceptInvitationPath(invitationId: string) {
  return `/accept-invitation/${encodeURIComponent(invitationId)}`
}
