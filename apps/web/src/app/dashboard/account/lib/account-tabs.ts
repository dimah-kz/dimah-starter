import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"
import {
  MonitorSmartphoneIcon,
  PaletteIcon,
  ShieldCheckIcon,
  UserRoundIcon,
} from "lucide-react"

/** Add a row when you add an account route under `dashboard/account/<segment>/`. */
export const accountTabs = [
  {
    key: "profile",
    labelKey: "accountTabs.profile",
    descriptionKey: "accountTabDescriptions.profile",
    icon: UserRoundIcon,
    href: dashboardRoutes.accountProfile(),
  },
  {
    key: "security",
    labelKey: "accountTabs.security",
    descriptionKey: "accountTabDescriptions.security",
    icon: ShieldCheckIcon,
    href: dashboardRoutes.accountSecurity(),
  },
  {
    key: "sessions",
    labelKey: "accountTabs.sessions",
    descriptionKey: "accountTabDescriptions.sessions",
    icon: MonitorSmartphoneIcon,
    href: dashboardRoutes.accountSessions(),
  },
  {
    key: "preferences",
    labelKey: "accountTabs.preferences",
    descriptionKey: "accountTabDescriptions.preferences",
    icon: PaletteIcon,
    href: dashboardRoutes.accountPreferences(),
  },
] as const
