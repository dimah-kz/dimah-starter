import { cacheLife, cacheTag } from "next/cache"
import { HomeIcon, UserCircleIcon } from "lucide-react"
import type { NavMainGroup } from "@/app/dashboard/components/sidebar/nav-main"
import type { SidebarOrganizationItem } from "@/app/dashboard/components/sidebar/organization-switcher"
import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import {
  buildSidebarNavSections,
  organizationEntryIcon,
  organizationNavSection,
  platformEntryIcon,
  platformNavSection,
  type SidebarNavSection,
} from "@/app/dashboard/lib/sidebar-nav-sections"
import {
  dashboardAuthHeaders,
  listDashboardOrganizations,
  resolveDashboardActiveOrganizationId,
} from "@/app/dashboard/lib/dashboard-session"
import { auth } from "@repo/auth"

export type DashboardSidebarProps = {
  organizations: SidebarOrganizationItem[]
  activeOrganizationId: string | null
  navGroups: NavMainGroup[]
  navSections: SidebarNavSection[]
}

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

async function getDashboardSidebarNavConfig(
  userId: string,
  isPersonalAccount: boolean,
  canManageActiveOrganization: boolean,
  canAccessAdmin: boolean
): Promise<Pick<DashboardSidebarProps, "navGroups" | "navSections">> {
  "use cache"

  cacheLife("minutes")
  cacheTag(dashboardCacheTags.sidebarConfigByUser(userId))

  const permissions = {
    canAccessAdmin,
    canManageActiveOrganization,
  }

  return {
    navGroups: buildNavGroups({
      isPersonalAccount,
      ...permissions,
    }),
    navSections: buildSidebarNavSections(permissions),
  }
}

export async function getDashboardSidebarProps(
  userId: string
): Promise<DashboardSidebarProps> {
  const activeOrganizationId = await resolveDashboardActiveOrganizationId()
  const isPersonalAccount = activeOrganizationId === null
  const requestHeaders = await dashboardAuthHeaders()

  const [organizations, canManageActiveOrganization, adminPermission] =
    await Promise.all([
      listDashboardOrganizations(),
      activeOrganizationId
        ? auth.api
            .hasPermission({
              headers: requestHeaders,
              body: {
                organizationId: activeOrganizationId,
                permissions: { member: ["update"] },
              },
            })
            .then((result) => result.success)
        : false,
      auth.api.userHasPermission({
        headers: requestHeaders,
        body: { permissions: { user: ["list"] } },
      }),
    ])

  const { navGroups, navSections } = await getDashboardSidebarNavConfig(
    userId,
    isPersonalAccount,
    canManageActiveOrganization,
    adminPermission.success
  )

  return {
    organizations: organizations.map((organization) => ({
      id: organization.id,
      name: organization.name,
      logo: organization.logo ?? null,
    })),
    activeOrganizationId,
    navGroups,
    navSections,
  }
}
