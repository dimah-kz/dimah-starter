import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"
import { MailIcon, SettingsIcon, UsersIcon } from "lucide-react"

/** Add a row when you add a manage route under `dashboard/manage/<segment>/`. */
export const organizationManageTabs = [
  {
    key: "members",
    labelKey: "manageTabs.members",
    icon: UsersIcon,
    href: dashboardRoutes.organizationMembers(),
  },
  {
    key: "invitations",
    labelKey: "manageTabs.invitations",
    icon: MailIcon,
    href: dashboardRoutes.organizationInvitations(),
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
