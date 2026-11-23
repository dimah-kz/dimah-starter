# @repo/storage

[dimah-s3](https://s3.dimah.dev) 2 (the version is in the `catalog` of `pnpm-workspace.yaml`). The browser uploads straight to the bucket; this package owns the routes, who may call them, and the object rows.

| File                  | Owns                                                                                             |
| --------------------- | ------------------------------------------------------------------------------------------------ |
| `s3.ts`               | The instance: S3 client, bucket, guard, the `db()` plugin with scopes, `authorize` and the quota |
| `session-guard.ts`    | Instance guard: one session read per call, into `locals`                                         |
| `db-client.ts`        | `@dimah-s3/db` client over Drizzle, in the `storage` PostgreSQL schema (`s3.ts` and the CLI)     |
| `scope.ts`            | Owner → scope: `user:{id}` or `org:{id}`                                                         |
| `routes/index.ts`     | Flat route map and `routeOwners` (every route names its owner)                                   |
| `routes/<group>/*.ts` | One file per route, grouped like `@repo/api`                                                     |
| `objects.ts`          | `toOwnedPublicUrl`, `deleteRouteObjects`                                                         |
| `public-url.ts`       | `toPublicUrl` / `fromPublicUrl` over `S3_PUBLIC_BASE_URL`                                        |
| `s3-client.tsx`       | `S3ClientProvider`. Route names are inferred from `s3`                                           |
| `translations/`       | Persian strings for the dimah-s3 UI, in the order of `Translations` from `@dimah-s3/react`       |

Exports: `s3` (for the `/api/s3` handler), `toOwnedPublicUrl`, `deleteRouteObjects`, `fromPublicUrl`, `type RouteName`; `@repo/storage/s3-client` exports `S3ClientProvider`.

## Routes

`routes/profile/` holds one image per owner:

- `avatar` — the signed-in user (`user:{id}`)
- `logo` — the active organization (`org:{id}`). Members can read it; upload and delete need `organization:update`.

`@dimah-s3/db` binds every upload to the caller's scope, so a key from another scope is `OBJECT_NOT_FOUND`. Each scope is capped at 10 files and 20 MiB (`scopeQuota` in `s3.ts`). `authorize` refuses `update` (`PATCH /db/object`) and `folder.create`, `folder.update`, and `folder.delete`: nothing renames objects or uses folders. A listing with no folder stays allowed, including a `recursive` one, because cleanup lists a whole scope. Keys are `{route}/{ownerId}/{uuid}/{name}` and never reused, so public URLs are cached as immutable.

## Saving an image

The record (user `image`, organization `logo`) is the source of truth. A Server Action:

1. `toOwnedPublicUrl({ route, ownerId, key })` — `{ url }` only for an active row of that owner, else `{ error }`: `invalidImageKey` or `storagePublicUrlMissing`, keys in `common.errors` (`t(owned.error)`). It never throws.
2. Writes the URL with `auth.api`.
3. `deleteRouteObjects({ route, ownerId, keep: key, headers })` — removes the previous image and any upload the user never saved.

Remove is the same without `keep`. Cleanup runs after the write, so the record never points at a deleted object. Public URLs percent-encode each key segment; `fromPublicUrl` decodes them back to the key.

## Adding a route

1. Add `routes/<group>/<name>.ts` and spread the group into `routes/index.ts`.
2. Name its owner in `routeOwners` (a missing owner is a type error).
3. Add cases to `routes/routes.test.ts`: who may upload, read, and delete, and where the key lands. It runs the real guards on the in-memory S3 of `@dimah-s3/server/testing`, with `@repo/auth` mocked.
4. Use it from `useUpload({ route })`. The client picks the name up from `s3`.

## Environment

`DIMAH_S3_SECRET` (at least 32 characters, the same on every instance) and the `S3_*` variables in `.env.example`. The bucket needs CORS for `GET`, `PUT`, and `HEAD` from the app origin ([providers](https://s3.dimah.dev/docs/providers)), and `S3_PUBLIC_BASE_URL` must serve the objects (public bucket or CDN).

Importing the package never throws: without `S3_BUCKET`, every storage call fails with `[storage] S3_BUCKET is not set` in the server log.

## Production

- Rows live in the `storage` PostgreSQL schema (schema 2.3.0, `@repo/db`). `scripts/dimah-s3.ts` runs the FumaDB CLI of `@dimah-s3/db` over the same client as `s3.ts` (`db-client.ts`): after upgrading dimah-s3, run `pnpm --filter @repo/db storage:generate`, then `db:generate` and `db:migrate`. When the generated file does not change, there is nothing to migrate (2.0.0 keeps schema 2.3.0). `@dimah-s3/db` does not upgrade an existing database itself, so read a generated migration first. A new required column needs a backfill for the rows already there, as `20261114234530_dimah_s3_search_name` does for `search_name`. A renamed column must stay a rename: `20261121070354_dimah_s3_schema_2_3_0` turns `filename` into `name` and `e_tag` into `etag` without dropping the rows.
- Deletes are soft: the object leaves S3, the row stays as `deleted`.
- An upload that never confirms leaves a `pending` row, and can leave an object or an unfinished multipart upload. Schedule `pnpm storage:purge` hourly to clean them up.
- An `AbortIncompleteMultipartUpload` lifecycle rule on the bucket is a good backstop.

### Purging stale uploads

`pnpm storage:purge` runs `scripts/purge.ts`:

1. `s3.db.purgeStale()`, repeated until no stale upload is left. For each upload past its confirm deadline it aborts the multipart upload, deletes the object the upload left, and removes the `pending` row — [Purge](https://s3.dimah.dev/docs/db/purge).
2. `s3.db.pruneDeleted()` drops rows deleted more than 30 days ago.

It reads `DATABASE_URL` and the `S3_*` variables from the environment, or from the root `.env`. It prints a summary and exits 1 when an upload could not be purged. A later run retries that upload once its 15-minute claim lapses.

Run it from any scheduler that has a checkout with dependencies installed:

```bash
# crontab: every hour
0 * * * * cd /srv/dimah-starter && pnpm storage:purge
```

Serverless hosts such as Vercel only schedule HTTP requests. Use a server crontab, your platform's cron job, or the included [`storage-purge.yml`](../../.github/workflows/storage-purge.yml) workflow: it runs hourly once the repository variable `STORAGE_PURGE` is `true` and the secrets it lists are set.
