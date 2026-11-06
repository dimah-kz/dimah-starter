import { toPublicUrl } from "./public-url"
import { routeOwners, type RouteName } from "./routes"
import { bucket, s3 } from "./s3"
import { toScope, type Owner } from "./scope"

export type OwnedPublicUrl =
  { url: string } | { error: "invalid" | "unconfigured" }

/**
 * Public URL of `key` when it is an active `route` object of `ownerId`.
 * `invalid` when it is not. `unconfigured` when `S3_PUBLIC_BASE_URL` is unset.
 */
export async function toOwnedPublicUrl(input: {
  route: RouteName
  ownerId: string
  key: string
}): Promise<OwnedPublicUrl> {
  const row = await s3.db.objects.find({ bucket, key: input.key })
  if (
    !row ||
    row.status !== "active" ||
    row.route !== input.route ||
    row.scope !== toScope(routeOwners[input.route], input.ownerId)
  ) {
    return { error: "invalid" }
  }
  const url = toPublicUrl(row.key)
  return url ? { url } : { error: "unconfigured" }
}

/**
 * Deletes the owner's `route` objects except `keep`, through `s3.api` with
 * the caller's `headers`, so the route guards apply. Call it after the record
 * points at `keep` (or at nothing): a replaced picture, or an upload the user
 * never saved, then leaves the bucket. Never throws; failures are logged.
 */
export async function deleteRouteObjects(input: {
  route: RouteName
  ownerId: string
  keep?: string
  headers: Headers
}) {
  const { route, ownerId, keep, headers } = input
  try {
    const { objects } = await s3.db.objects.list({
      scope: toScope(routeOwners[route], ownerId),
      route,
      limit: 100,
    })
    const keys = objects
      .map((object) => object.key)
      .filter((key) => key !== keep)
    if (keys.length === 0) return
    const { failed } = await s3.api.deleteMany({ route, keys }, { headers })
    if (failed.length > 0) console.error("[storage] delete failed", failed)
  } catch (error) {
    console.error("[storage] delete failed", error)
  }
}

/**
 * Deletes every object of an owner that no longer exists, such as a deleted
 * organization. Nobody can pass its route guards any more, so this runs as a
 * `system` call. Never throws; failures are logged.
 */
export async function deleteOwnedObjects(owner: Owner, ownerId: string) {
  const scope = toScope(owner, ownerId)
  const locals =
    owner === "organization"
      ? { system: true, organizationId: ownerId }
      : { system: true, userId: ownerId }
  try {
    let cursor: string | null = null
    do {
      const page = await s3.db.objects.list({ scope, limit: 100, cursor })
      const keysByRoute: Record<string, string[]> = {}
      for (const object of page.objects) {
        ;(keysByRoute[object.route] ??= []).push(object.key)
      }
      for (const [route, keys] of Object.entries(keysByRoute)) {
        const { failed } = await s3.api.deleteMany(
          { route: route as RouteName, keys },
          { locals }
        )
        if (failed.length > 0) console.error("[storage] delete failed", failed)
      }
      cursor = page.nextCursor
    } while (cursor)
  } catch (error) {
    console.error("[storage] delete failed", error)
  }
}
