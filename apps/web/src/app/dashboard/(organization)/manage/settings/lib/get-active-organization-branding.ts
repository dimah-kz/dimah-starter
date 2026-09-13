import { cacheLife, cacheTag } from "next/cache"
import { eq } from "@repo/db/drizzle"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { organization } from "@repo/db/schema"
import { db } from "@repo/db"

export type OrganizationBranding = {
  id: string
  name: string
  slug: string
  logo: string | null
}

export async function getActiveOrganizationBranding(organizationId: string) {
  "use cache"

  cacheLife("minutes")
  cacheTag(dashboardCacheTags.organizationBrandingById(organizationId))

  const [branding] = await db
    .select({
      id: organization.id,
      name: organization.name,
      slug: organization.slug,
      logo: organization.logo,
    })
    .from(organization)
    .where(eq(organization.id, organizationId))
    .limit(1)

  return branding ?? null
}
