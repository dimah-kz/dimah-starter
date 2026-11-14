const DASHBOARD_BASE_PATH = "/dashboard"

/** Path segment literals — keep in sync with `src/app/dashboard/` route tree. */
export const dashboardRouteSegments = {
  admin: "admin",
  organizations: "organizations",
  account: "account",
  profile: "profile",
  security: "security",
  sessions: "sessions",
  preferences: "preferences",
  manage: "manage",
  members: "members",
  invitations: "invitations",
  settings: "settings",
  users: "users",
} as const

/** Path segments that appear in dashboard breadcrumbs (plus the root segment). */
export const dashboardBreadcrumbSegments = new Set([
  "dashboard",
  ...Object.values(dashboardRouteSegments),
])

function managePath(...rest: string[]) {
  const tail = rest.length ? `/${rest.join("/")}` : ""
  return `${DASHBOARD_BASE_PATH}/${dashboardRouteSegments.manage}${tail}`
}

function adminPath(...rest: string[]) {
  const tail = rest.length ? `/${rest.join("/")}` : ""
  return `${DASHBOARD_BASE_PATH}/${dashboardRouteSegments.admin}${tail}`
}

function accountPath(...rest: string[]) {
  const tail = rest.length ? `/${rest.join("/")}` : ""
  return `${DASHBOARD_BASE_PATH}/${dashboardRouteSegments.account}${tail}`
}

export const dashboardRoutes = {
  home: () => DASHBOARD_BASE_PATH,
  adminRoot: () => adminPath(),
  adminUsers: () => adminPath(dashboardRouteSegments.users),
  adminOrganizations: () => adminPath(dashboardRouteSegments.organizations),
  accountRoot: () => accountPath(),
  accountProfile: () => accountPath(dashboardRouteSegments.profile),
  accountSecurity: () => accountPath(dashboardRouteSegments.security),
  accountSessions: () => accountPath(dashboardRouteSegments.sessions),
  accountPreferences: () => accountPath(dashboardRouteSegments.preferences),
  organizationManageRoot: () => managePath(),
  organizationMembers: () => managePath(dashboardRouteSegments.members),
  organizationInvitations: () => managePath(dashboardRouteSegments.invitations),
  organizationSettings: () => managePath(dashboardRouteSegments.settings),
} as const
