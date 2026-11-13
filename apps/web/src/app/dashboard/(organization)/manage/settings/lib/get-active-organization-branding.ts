import { cacheLife, cacheTag } from "next/cache"
import { eq } from "@repo/db/drizzle"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { requireOrganizationManager } from "@/app/dashboard/lib/dashboard-session"
import { organization } from "@repo/db/schema"
import { db } from "@repo/db"

export type OrganizationBranding = {
  id: string
  name: string
  slug: string
  logo: string | null
}

/** Organization managers only — checks the caller, then reads the cached row. */
export async function getActiveOrganizationBranding() {
  const { organizationId } = await requireOrganizationManager()
  return getCachedBranding(organizationId)
}

async function getCachedBranding(
  organizationId: string
): Promise<OrganizationBranding | null> {
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
