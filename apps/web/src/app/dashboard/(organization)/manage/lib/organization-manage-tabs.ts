import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"
import { SettingsIcon, UsersIcon } from "lucide-react"

/** Add a row when you add a manage route under `dashboard/manage/<segment>/`. */
export const organizationManageTabs = [
  {
    key: "members",
    labelKey: "manageTabs.members",
    icon: UsersIcon,
    href: dashboardRoutes.organizationMembers(),
  },
  {
    key: "settings",
    labelKey: "manageTabs.settings",
    icon: SettingsIcon,
    href: dashboardRoutes.organizationSettings(),
  },
] as const

export type OrganizationManageTabKey =
  (typeof organizationManageTabs)[number]["key"]
