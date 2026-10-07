import { updateTag } from "next/cache"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"

export function invalidateOrganizationMembersCache(organizationId: string) {
  updateTag(dashboardCacheTags.organizationMembersById(organizationId))
}

export function invalidateOrganizationInvitationsCache(organizationId: string) {
  updateTag(dashboardCacheTags.organizationInvitationsById(organizationId))
}

export function invalidateOrganizationBrandingCache(organizationId: string) {
  updateTag(dashboardCacheTags.organizationBrandingById(organizationId))
}
