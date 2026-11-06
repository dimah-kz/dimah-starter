import { adminSlices } from "@/app/dashboard/admin/lib/admin-slices"
import { organizationManageTabs } from "@/app/dashboard/(organization)/manage/lib/organization-manage-tabs"
import type { NavMainItem } from "@/app/dashboard/components/sidebar/nav-main"
import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"
import { isPathActive } from "@/app/dashboard/lib/path-utils"
import { Building2Icon, ShieldIcon } from "lucide-react"
import { createElement } from "react"

export type SidebarNavSection = {
  id: string
  pathPrefix: string
  titleKey: NavMainItem["titleKey"]
  entryUrl: string
  backUrl: string
  items: NavMainItem[]
}

function sliceToNavItem(slice: {
  labelKey: NavMainItem["titleKey"]
  href: string
  icon: React.ComponentType<{ className?: string }>
}): NavMainItem {
  return {
    titleKey: slice.labelKey,
    url: slice.href,
    icon: createElement(slice.icon, { className: "size-4" }),
  }
}

export const platformNavSection: SidebarNavSection = {
  id: "platform",
  pathPrefix: dashboardRoutes.adminRoot(),
  titleKey: "nav.sidebar.platformManagement",
  entryUrl: dashboardRoutes.adminUsers(),
  backUrl: dashboardRoutes.home(),
  items: adminSlices.map(sliceToNavItem),
}

export const organizationNavSection: SidebarNavSection = {
  id: "organization",
  pathPrefix: dashboardRoutes.organizationManageRoot(),
  titleKey: "nav.sidebar.organizationManagement",
  entryUrl: dashboardRoutes.organizationMembers(),
  backUrl: dashboardRoutes.home(),
  items: organizationManageTabs.map(sliceToNavItem),
}

export function buildSidebarNavSections(input: {
  canAccessAdmin: boolean
  canManageActiveOrganization: boolean
}): SidebarNavSection[] {
  const sections: SidebarNavSection[] = []

  if (input.canAccessAdmin) {
    sections.push(platformNavSection)
  }

  if (input.canManageActiveOrganization) {
    sections.push(organizationNavSection)
  }

  return sections
}

export function resolveSidebarNavSection(
  pathname: string,
  sections: SidebarNavSection[]
): SidebarNavSection | undefined {
  return sections.find((section) => isPathActive(pathname, section.pathPrefix))
}

export const platformEntryIcon = createElement(ShieldIcon, {
  className: "size-4",
})

export const organizationEntryIcon = createElement(Building2Icon, {
  className: "size-4",
})
