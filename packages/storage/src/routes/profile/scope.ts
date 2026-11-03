import type { Session } from "@repo/auth"
import { toAvatarScope } from "./avatar"
import { toLogoScope } from "./logo"

export const imageRoutes = ["avatar", "logo"] as const

export type ImageRoute = (typeof imageRoutes)[number]

/** Scope stored on the object row (`user:{id}` or `org:{id}`). */
export function toProfileScope(routeName: ImageRoute, ownerId: string) {
  return routeName === "logo" ? toLogoScope(ownerId) : toAvatarScope(ownerId)
}

/**
 * Scope of the caller. Logo uses the active organization.
 * Any other call, including a database list with no route, is the signed-in user.
 */
export function toCallerScope(session: Session | null, routeName?: string) {
  if (!session) return null
  if (routeName === "logo") {
    const organizationId = session.session.activeOrganizationId
    return organizationId ? toLogoScope(organizationId) : null
  }
  return toAvatarScope(session.user.id)
}
