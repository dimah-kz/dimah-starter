/** Tagged cache builders for dashboard reads — extend per feature. */
export const dashboardCacheTags = {
  adminUsersPage: () => "dashboard:admin:users",
  adminOrganizationsPage: () => "dashboard:admin:organizations",
  sidebarConfigByUser: (userId: string) => `dashboard:sidebar:user:${userId}`,
  userProfileById: (userId: string) => `dashboard:user-profile:${userId}`,
  organizationMembersById: (organizationId: string) =>
    `dashboard:org:${organizationId}:members`,
  organizationInvitationsById: (organizationId: string) =>
    `dashboard:org:${organizationId}:invitations`,
  organizationBrandingById: (organizationId: string) =>
    `dashboard:org:${organizationId}:branding`,
} as const
