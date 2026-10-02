import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"
import { Building2Icon, UserCogIcon } from "lucide-react"

/**
 * Platform admin destinations. Sidebar drill-down reads this list.
 */
export const adminSlices = [
  {
    key: "users",
    labelKey: "adminTabs.users",
    icon: UserCogIcon,
    href: dashboardRoutes.adminUsers(),
  },
  {
    key: "organizations",
    labelKey: "adminTabs.organizations",
    icon: Building2Icon,
    href: dashboardRoutes.adminOrganizations(),
  },
] as const

export type AdminSliceKey = (typeof adminSlices)[number]["key"]
