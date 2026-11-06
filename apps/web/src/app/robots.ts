import type { MetadataRoute } from "next"
import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"
import { toAbsoluteAppUrl } from "@repo/auth/app-origin"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [dashboardRoutes.home(), "/api/"],
    },
    sitemap: toAbsoluteAppUrl("/sitemap.xml"),
  }
}
