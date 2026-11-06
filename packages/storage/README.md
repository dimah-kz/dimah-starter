# @repo/storage

[dimah-s3](https://s3.dimah.dev) 2.0 beta (`2.0.0-beta.5`). The browser uploads straight to the bucket; this package owns the routes, who may call them, and the object rows.

| File                  | Owns                                                                                               |
| --------------------- | -------------------------------------------------------------------------------------------------- |
| `s3.ts`               | S3 client, the session guard (one read per call, into `locals`), the `db()` plugin over `@repo/db` |
| `scope.ts`            | Owner → scope: `user:{id}` or `org:{id}`                                                           |
| `routes/index.ts`     | Flat route map and `routeOwners` (every route names its owner)                                     |
| `routes/<group>/*.ts` | One file per route, grouped like `@repo/api`                                                       |
| `objects.ts`          | `toOwnedPublicUrl`, `deleteRouteObjects`, `deleteOwnedObjects`                                     |
| `public-url.ts`       | `toPublicUrl` / `fromPublicUrl` over `S3_PUBLIC_BASE_URL`                                          |
| `s3-client.tsx`       | `S3ClientProvider`. Route names are inferred from `s3`                                             |

Exports: `s3` (for the `/api/s3` handler), `toOwnedPublicUrl`, `deleteRouteObjects`, `deleteOwnedObjects`, `fromPublicUrl`, `type RouteName`; `@repo/storage/s3-client` exports `S3ClientProvider`.

## Routes

`routes/profile/` holds one image per owner:

- `avatar` — the signed-in user (`user:{id}`)
- `logo` — the active organization (`org:{id}`). Members can read it; upload and delete need `organization:update`.

`@dimah-s3/db` binds every upload to the caller's scope, so a key from another scope is `OBJECT_NOT_FOUND`. Each scope is capped at 10 files and 20 MiB (`scopeQuota` in `s3.ts`). `PATCH /db/object` and the folder endpoints are refused: nothing renames objects or uses folders. Keys are `{route}/{ownerId}/{uuid}/{name}` and never reused, so public URLs are cached as immutable.

## Saving an image

The record (user `image`, organization `logo`) is the source of truth. A Server Action:

1. `toOwnedPublicUrl({ route, ownerId, key })` — `{ url }` only for an active row of that owner, else `{ error }`: `invalidImageKey` or `storagePublicUrlMissing`, keys in `common.errors` (`t(owned.error)`). It never throws.
2. Writes the URL with `auth.api`.
3. `deleteRouteObjects({ route, ownerId, keep: key, headers })` — removes the previous image and any upload the user never saved.

Remove is the same without `keep`. Cleanup runs after the write, so the record never points at a deleted object. Public URLs percent-encode each key segment; `fromPublicUrl` decodes them back to the key.

## Adding a route

1. Add `routes/<group>/<name>.ts` and spread the group into `routes/index.ts`.
2. Name its owner in `routeOwners` (a missing owner is a type error).
3. Use it from `useUpload({ route })`. The client picks the name up from `s3`.

Deleting an owner (`deleteOrganizationAction`) calls `deleteOwnedObjects(owner, id)`, which removes every object in that scope as a `system` call. Both delete helpers page through the rows and log a failed batch without stopping.

## Environment

`DIMAH_S3_SECRET` (at least 32 characters, the same on every instance) and the `S3_*` variables in `.env.example`. The bucket needs CORS for `GET`, `PUT`, and `HEAD` from the app origin ([providers](https://s3.dimah.dev/docs/providers)), and `S3_PUBLIC_BASE_URL` must serve the objects (public bucket or CDN).

Importing the package never throws: without `S3_BUCKET`, every storage call fails with `[storage] S3_BUCKET is not set` in the server log.

## Production

- Rows live in the `storage` PostgreSQL schema (schema 2.1.0, `@repo/db`).
- Deletes are soft: the object leaves S3, the row stays as `deleted`.
- Uploads that never confirm leave `pending` rows. Run `s3.db.purgeStale()` from a scheduled job, and `s3.db.pruneDeleted({ olderThan })` to drop old rows — [Purge](https://s3.dimah.dev/docs/db/purge). An `AbortIncompleteMultipartUpload` lifecycle rule on the bucket is a good backstop.
