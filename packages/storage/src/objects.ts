import { DELETE_MANY_MAX_KEYS } from "@dimah-s3/core"
import type { S3ServerCallOptions } from "@dimah-s3/server"
import { toPublicUrl } from "./public-url"
import { routeOwners, type RouteName } from "./routes"
import { bucket, s3 } from "./s3"
import { toScope, type Owner } from "./scope"

/**
 * Public URL of `key` when it is an active `route` object of `ownerId`. The
 * error is a `common.errors` message key. Never throws: `key` comes from the
 * browser, and a failed lookup is logged.
 */
export async function toOwnedPublicUrl(input: {
  route: RouteName
  ownerId: string
  key: string
}): Promise<
  { url: string } | { error: "storagePublicUrlMissing" | "invalidImageKey" }
> {
  const { route, ownerId, key } = input
  if (typeof key !== "string" || key.length === 0) {
    return { error: "invalidImageKey" }
  }
  try {
    const row = await s3.db.objects.find({ bucket, key })
    if (
      !row ||
      row.status !== "active" ||
      row.route !== route ||
      row.scope !== toScope(routeOwners[route], ownerId)
    ) {
      return { error: "invalidImageKey" }
    }
    const url = toPublicUrl(row.key)
    return url ? { url } : { error: "storagePublicUrlMissing" }
  } catch (error) {
    console.error("[storage] object lookup failed", error)
    return { error: "invalidImageKey" }
  }
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
  await deleteScopeObjects(
    { scope: toScope(routeOwners[route], ownerId), route, keep },
    { headers }
  )
}

/**
 * Deletes every object of an owner that no longer exists, such as a deleted
 * organization. Nobody can pass its route guards any more, so this runs as a
 * `system` call. Never throws; failures are logged.
 */
export async function deleteOwnedObjects(owner: Owner, ownerId: string) {
  await deleteScopeObjects(
    { scope: toScope(owner, ownerId) },
    {
      locals:
        owner === "organization"
          ? { system: true, organizationId: ownerId }
          : { system: true, userId: ownerId },
    }
  )
}

/**
 * Deletes the active objects of `scope` (of one `route` when given) except
 * `keep`, one page per `deleteMany`. A failed batch is logged and the sweep
 * goes on; a failed listing ends it.
 */
async function deleteScopeObjects(
  filter: { scope: string; route?: RouteName; keep?: string },
  options: S3ServerCallOptions
) {
  const { scope, route, keep } = filter
  let cursor: string | null = null
  do {
    let page
    try {
      page = await s3.db.objects.list({
        scope,
        route,
        limit: DELETE_MANY_MAX_KEYS,
        cursor,
      })
    } catch (error) {
      console.error("[storage] list failed", error)
      return
    }
    const keysByRoute = new Map<RouteName, string[]>()
    for (const object of page.objects) {
      if (object.key === keep) continue
      const objectRoute = object.route as RouteName
      const keys = keysByRoute.get(objectRoute) ?? []
      keys.push(object.key)
      keysByRoute.set(objectRoute, keys)
    }
    for (const [objectRoute, keys] of keysByRoute) {
      try {
        const { failed } = await s3.api.deleteMany(
          { route: objectRoute, keys },
          options
        )
        if (failed.length > 0) console.error("[storage] delete failed", failed)
      } catch (error) {
        console.error("[storage] delete failed", error)
      }
    }
    cursor = page.nextCursor
  } while (cursor)
}
