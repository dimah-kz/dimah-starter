import { HomeIcon, UserCircleIcon } from "lucide-react"
import type { NavMainGroup } from "@/app/dashboard/components/sidebar/nav-main"
import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"
import {
  buildSidebarNavSections,
  organizationEntryIcon,
  organizationNavSection,
  platformEntryIcon,
  platformNavSection,
} from "@/app/dashboard/lib/sidebar-nav-sections"
import {
  canAccessPlatformAdmin,
  canManageOrganization,
  listDashboardOrganizations,
  resolveDashboardActiveOrganizationId,
} from "@/app/dashboard/lib/dashboard-session"

function buildNavGroups(input: {
  isPersonalAccount: boolean
  canManageActiveOrganization: boolean
  canAccessAdmin: boolean
}): NavMainGroup[] {
  const groups: NavMainGroup[] = [
    {
      id: "main",
      items: [
        {
          titleKey: "nav.sidebar.dashboard",
          url: dashboardRoutes.home(),
          icon: <HomeIcon className="size-4" />,
        },
      ],
    },
  ]

  const mainItems = groups[0]!.items

  if (input.isPersonalAccount) {
    mainItems.push({
      titleKey: "nav.sidebar.account",
      url: dashboardRoutes.account(),
      icon: <UserCircleIcon className="size-4" />,
    })

    if (input.canAccessAdmin) {
      groups.push({
        id: "platform",
        labelKey: "nav.sidebar.platform",
        items: [
          {
            titleKey: "nav.sidebar.platformManagement",
            url: platformNavSection.entryUrl,
            icon: platformEntryIcon,
          },
        ],
      })
    }
  } else if (input.canManageActiveOrganization) {
    groups.push({
      id: "organization",
      labelKey: "nav.sidebar.organization",
      items: [
        {
          titleKey: "nav.sidebar.organizationManagement",
          url: organizationNavSection.entryUrl,
          icon: organizationEntryIcon,
        },
      ],
    })
  }

  return groups
}

/** Sidebar data for the signed-in user. Request-scoped — never cached. */
export async function getDashboardSidebarProps() {
  const activeOrganizationId = await resolveDashboardActiveOrganizationId()

  const [organizations, canManageActiveOrganization, canAccessAdmin] =
    await Promise.all([
      listDashboardOrganizations(),
      activeOrganizationId
        ? canManageOrganization(activeOrganizationId)
        : false,
      canAccessPlatformAdmin(),
    ])

  const permissions = { canAccessAdmin, canManageActiveOrganization }

  return {
    organizations: organizations.map((organization) => ({
      id: organization.id,
      name: organization.name,
      logo: organization.logo ?? null,
    })),
    activeOrganizationId,
    navGroups: buildNavGroups({
      isPersonalAccount: activeOrganizationId === null,
      ...permissions,
    }),
    navSections: buildSidebarNavSections(permissions),
  }
}
