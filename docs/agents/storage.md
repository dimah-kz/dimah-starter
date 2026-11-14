# Storage uploads

Read when you add an upload, change who may upload or read a file, or save or remove an uploaded image.

`@repo/storage` runs dimah-s3 2 beta. The browser uploads straight to the bucket with a signed ticket from `/api/s3`. The package owns the routes, who may call them, and the object rows in the `storage` PostgreSQL schema. Package details: [packages/storage/README.md](../../packages/storage/README.md).

## Routes and owners

- **A route is a file:** `packages/storage/src/routes/<group>/<name>.ts`, spread into `routes/index.ts` through its group's `index.ts`.
- **Every route names an owner** in `routeOwners`: `user` or `organization`. The owner decides the scope: `user:{id}` or `org:{id}`. A missing owner is a type error.
- **The instance guard** reads the session once into `locals`. `@dimah-s3/db` resolves the caller's scope from `locals`, so a key from another scope is `OBJECT_NOT_FOUND`.
- **Access rules live on the route:** a route guard throws `s3Error("FORBIDDEN")`. Reference: `routes/profile/logo.ts` — members read it, and upload or delete needs `organization:update`.
- **Quotas:** each scope holds at most 10 files and 20 MiB (`scopeQuota` in `s3.ts`).

## Save an uploaded file

On the client, use `useUpload({ route })`, or `AvatarUpload` from `@dimah-s3/ui` (see `apps/web/src/components/form/avatar-upload-field.tsx`). Route names are inferred from the server instance. Leave out `accept` and `maxFileSize`: the route's limits apply.

The Server Action that saves the key — reference `apps/web/src/app/action/dashboard/account/set-account-avatar-action.ts`:

1. **Resolve the URL:** `toOwnedPublicUrl({ route, ownerId, key })`. The owner comes from the session (the user id, or the active organization for `logo`), never from the client. It returns `{ url }` only for an active object of that owner, otherwise `{ error }` with a `common.errors` message key: `t(owned.error)`.
2. **Write the URL** to the record with `auth.api` (or your product write).
3. **Clean up:** `after(() => deleteRouteObjects({ route, ownerId, keep: key, headers }))` deletes the previous file and uploads that were never saved. Run it after the write, so the record never points at a deleted object.
4. **Expire caches** — [nextjs.md § After a write](./nextjs.md#after-a-write).

- **Remove an image:** write `""`, then make the same cleanup call without `keep`.
- **Delete an owner** (for example an organization): `after(() => deleteOwnedObjects("organization", id))` deletes everything in that scope as a system call.

## Operations

- **Purge:** `pnpm storage:purge` deletes uploads that never confirmed and prunes old soft-deleted rows. Schedule it hourly; `.github/workflows/storage-purge.yml` does that once enabled.
- **After upgrading dimah-s3:** run `pnpm --filter @repo/db storage:generate`, then `db:generate` and `db:migrate`.
