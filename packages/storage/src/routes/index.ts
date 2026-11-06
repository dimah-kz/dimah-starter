import type { Owner } from "../scope"
import { profile } from "./profile"

/**
 * Flat route map for `dimahS3`. Add a group under `routes/<group>/`, spread
 * it here, and give each route an owner in `routeOwners`.
 */
export const routes = {
  ...profile,
}

export type RouteName = keyof typeof routes

/** Whose scope each route's objects live in. Every route must have one. */
export const routeOwners = {
  avatar: "user",
  logo: "organization",
} as const satisfies Record<RouteName, Owner>

/** Owner of `route`. A call without a route, such as a db read, is the user's. */
export function toRouteOwner(route: string | undefined): Owner {
  return route && Object.hasOwn(routeOwners, route)
    ? routeOwners[route as RouteName]
    : "user"
}
