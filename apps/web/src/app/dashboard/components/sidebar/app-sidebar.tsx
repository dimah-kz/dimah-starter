"use client"

import {
  NavMain,
  type NavMainGroup,
} from "@/app/dashboard/components/sidebar/nav-main"
import type { SidebarNavSection } from "@/app/dashboard/lib/sidebar-nav-sections"
import {
  NavUser,
  type NavUserProfile,
} from "@/app/dashboard/components/sidebar/nav-user"
import { OrganizationSwitcher } from "@/app/dashboard/components/sidebar/organization-switcher"
import { useSidebarSide } from "@/app/dashboard/components/sidebar/sidebar-side"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@repo/ui/components/sidebar"

type AppSidebarProps = {
  user: NavUserProfile
  navGroups: NavMainGroup[]
  navSections: SidebarNavSection[]
  organizations: React.ComponentProps<
    typeof OrganizationSwitcher
  >["organizations"]
  activeOrganizationId: string | null
} & React.ComponentProps<typeof Sidebar>

export function AppSidebar({
  user,
  navGroups,
  navSections,
  organizations,
  activeOrganizationId,
  ...props
}: AppSidebarProps) {
  const side = useSidebarSide()

  return (
    <Sidebar side={side} {...props}>
      <SidebarHeader>
        <OrganizationSwitcher
          user={user}
          organizations={organizations}
          activeOrganizationId={activeOrganizationId}
        />
      </SidebarHeader>
      <SidebarContent className="mt-4 gap-0">
        <NavMain groups={navGroups} sections={navSections} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
