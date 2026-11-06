import type { MetadataRoute } from "next"
import { authRoutes } from "@/app/(auth)/lib/auth-routes"
import { marketingRoutes } from "@/app/(marketing)/lib/marketing-routes"
import { toAbsoluteAppUrl } from "@repo/auth/app-origin"

/**
 * Indexable pages only. Add each new public page here; private and one-time
 * pages (dashboard, password reset, invitations) stay out.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: toAbsoluteAppUrl(marketingRoutes.home()),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: toAbsoluteAppUrl(authRoutes.signup()),
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: toAbsoluteAppUrl(authRoutes.login()),
      changeFrequency: "yearly",
      priority: 0.5,
    },
  ]
}
