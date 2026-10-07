import { acceptInvitationPath, loginPath } from "@repo/auth/paths"

export const authRoutes = {
  login: () => loginPath,
  signup: () => "/signup",
  forgotPassword: () => "/forgot-password",
  resetPassword: () => "/reset-password",
  verifyEmail: () => "/verify-email",
  acceptInvitation: (invitationId: string) =>
    acceptInvitationPath(invitationId),
} as const

export type AuthRoutePath =
  | ReturnType<(typeof authRoutes)["login"]>
  | ReturnType<(typeof authRoutes)["signup"]>
  | ReturnType<(typeof authRoutes)["forgotPassword"]>
  | ReturnType<(typeof authRoutes)["resetPassword"]>
  | ReturnType<(typeof authRoutes)["verifyEmail"]>
