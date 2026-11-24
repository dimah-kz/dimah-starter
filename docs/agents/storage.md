# Storage uploads

Read when you add an upload, change who may upload or read a file, or save or remove an uploaded image.

`@repo/storage` runs dimah-s3 2. The browser uploads straight to the bucket with a signed ticket from `/api/s3`. The package owns the routes, who may call them, and the object rows in the `storage` PostgreSQL schema. Package details: [packages/storage/README.md](../../packages/storage/README.md).

## Routes and owners

- **A route is a file:** `packages/storage/src/routes/<group>/<name>.ts`, spread into `routes/index.ts` through its group's `index.ts`.
- **Every route names an owner** in `routeOwners`: `user` or `organization`. The owner decides the scope: `user:{id}` or `org:{id}`. A missing owner is a type error.
- **The instance guard** (`session-guard.ts`) counts each call against the `storage` rate limit (300 a minute per IP, in `packages/auth/src/rate-limit.ts`, then `TOO_MANY_REQUESTS`) and reads the session once into `locals`. `@dimah-s3/db` resolves the caller's scope from `locals`, so a key from another scope is `OBJECT_NOT_FOUND`.
- **Access rules live on the route:** a route guard throws `s3Error("FORBIDDEN")`. Reference: `routes/profile/logo.ts` — members read it, and upload or delete needs `organization:update`.
- **Quotas:** each scope holds at most 10 files and 20 MiB (`scopeQuota` in `s3.ts`).
- **db operations:** `isAllowedDbOperation` in `scope.ts` names every `ScopeOperation` of `@dimah-s3/db` as allowed or refused. Renames, folders, and plugins on db (such as `@dimah-s3/share`) are refused. An operation a dimah-s3 upgrade adds is a type error until you decide it there.
- **Test the rules:** `routes/routes.test.ts` runs the session guard and every route on the in-memory S3 of `@dimah-s3/server/testing`. Add a case for each new route or guard rule.

## Save an uploaded file

On the client, use `useUpload({ route })`, or `AvatarUpload` from `@dimah-s3/ui` (see `apps/web/src/components/form/avatar-upload-field.tsx`). Route names are inferred from the server instance. Leave out `accept` and `maxFileSize`: the route's limits apply.

The Server Action that saves the key — reference `apps/web/src/app/action/dashboard/account/set-account-avatar-action.ts`:

1. **Resolve the URL:** `toOwnedPublicUrl({ route, ownerId, key })`. The owner comes from the session (the user id, or the active organization for `logo`), never from the client. It returns `{ url }` only for an active object of that owner, otherwise `{ error }` with a `common.errors` message key: `t(owned.error)`.
2. **Write the URL** to the record with `auth.api` (or your product write).
3. **Clean up:** `after(() => deleteRouteObjects({ route, ownerId, keep: key, headers }))` deletes the previous file and uploads that were never saved. Run it after the write, so the record never points at a deleted object.
4. **Expire caches** — [nextjs.md § After a write](./nextjs.md#after-a-write).

- **Remove an image:** write `""`, then make the same cleanup call without `keep`.

## Operations

- **Purge:** `pnpm storage:purge` deletes uploads that never confirmed and prunes old soft-deleted rows. Schedule it hourly; `.github/workflows/storage-purge.yml` does that once enabled.
- **After upgrading dimah-s3:** keep every `@dimah-s3/*` package on the same version in the `catalog`. Typecheck lists the Persian strings to add or drop in `translations/fa.ts`, and any new `ScopeOperation` to decide in `scope.ts`. Run `pnpm --filter @repo/db storage:generate`, then `db:generate`; no diff means no migration. Before `db:migrate`, read the SQL. A new required column needs a backfill for the rows already there, and a renamed column must stay a rename (`filename` → `name`, `e_tag` → `etag` in schema 2.3.0). A drop and add loses those rows.
