# Implementation

> Rule: `.cursor/rules/implementation.mdc`

Server Components by default. `"use client"` only for interactivity.

Mutations: `app/action/<segment>/` mirrors the route — validate → `auth.api` or `createRouterClient` → `updateTag` if the actor must see the change. [api.md](./api.md)

Suspense only around slices that call request APIs (`headers`, `cookies`) or read URL data (`params`, `searchParams`). Cached shells stay outside.

Next.js APIs: read `apps/web/node_modules/next/dist/docs/` first — [nextjs.md](./nextjs.md). Never web-search.

## Session {#auth--session}

| Helper                 | When                                                        |
| ---------------------- | ----------------------------------------------------------- |
| `auth.api.getSession`  | Read / route gate — `headers: await dashboardAuthHeaders()` |
| `auth.api` + `headers` | Mutations — `headers: await headers()`                      |

Never put session in `'use cache'`. `React.cache()` around `getSession` is request-scoped memoization and is OK. Do not gate before `auth.api`. Client components must not import `@repo/auth`.

Render-time `auth.api` uses `dashboardAuthHeaders()` (`await io()` then `headers()`). Better Auth reads `Date.now()` for expiry, and Partial Prefetching rejects that clock read before the Dynamic stage. Server Actions stay on `headers()`.

Server Components may render a Context imported from a `'use client'` module (no empty Provider wrapper). Do not invent a Context only to use that API.

Transient overlays: close them in `useLayoutEffect` cleanup so Cache Components `<Activity>` hide does not restore an open sheet.

Cookie cache (5 min) can lag ban/role changes — [better-auth.md](./better-auth.md).

## Storage uploads {#storage-uploads}

`@repo/storage` owns `dimahS3({ routes })` on dimah-s3 2.0 beta. A route is `src/routes/<group>/<name>.ts`; the group index spreads into `routes/index.ts`, and every route names its owner in `routeOwners` (`user` or `organization`). The instance guard reads the session once into `locals`; `@dimah-s3/db` resolves the caller's scope (`user:{id}` / `org:{id}`) from them and owns the rows. App actions persist the public URL, then clean up. [packages/storage/README.md](../../packages/storage/README.md)

1. Client: `useUpload({ route })` or `AvatarUpload`. Route names are inferred from the server. Omit `accept` / `maxFileSize` — the route catalog is the limit.
2. Access lives on the route: guards throw `s3Error`. `logo` lets members read and needs `organization:update` to upload or delete.
3. Persist with `toOwnedPublicUrl({ route, ownerId, key })`, then **`auth.api`**. It returns `{ url }` only for an active row of that owner, else `{ error }` — a `common.errors` key, so `t(owned.error)`. The owner comes from the session (user id, or the active organization for `logo`), never from the client.
4. After the write, `after(() => deleteRouteObjects({ route, ownerId, keep: key, headers }))` drops the previous object and unsaved uploads. Remove: write `""`, then the same call without `keep`. Never delete before the write.
5. Deleting an owner: `after(() => deleteOwnedObjects(owner, id))`.
6. `updateTag` — [caching.md](./caching.md).

Reference: `set-account-avatar-action.ts`, organization-logo siblings. Schema is 2.1.0 in `@repo/db` (`storage` PostgreSQL schema).

## Definition of done {#definition-of-done}

- `pnpm format:check`, `pnpm lint`, `pnpm typecheck` pass (CI runs them plus `pnpm build`)
- [Placement](./architecture.md#placement) — right app vs package
- SSOT updated (routes, tags, labels)
- Writes via `auth.api` or `createRouterClient`; `updateTag` when the actor must see the change
- No custom access modules
- New work only in `apps/web` + core packages
