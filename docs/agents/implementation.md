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

`@repo/storage` owns `dimahS3({ routes })` on dimah-s3 2.0 beta. A route is `src/routes/<group>/<name>.ts`; the group index spreads into `routes/index.ts`, and `s3.ts` only mounts that map. `@dimah-s3/db` owns scope, rows, and replacement of the previous object. App actions persist the public URL and invalidate cache.

1. Client: `useUpload({ route: "avatar" | "logo" })` or `AvatarUpload`. Omit `accept` / `maxFileSize` — the route catalog is the limit.
2. `avatar` is the signed-in user (`user:{id}`). `logo` is the active organization (`org:{id}`). Guards throw `s3Error`. `previousKey` deletes the previous object after confirm.
3. Persist with `toOwnedImageUrl({ route, ownerId, key })`, then **`auth.api`**. It returns a URL only for an active row in that scope.
4. On remove, `fromPublicUrl` + `s3.api.delete({ route, key }, { headers })`.
5. `updateTag` / `invalidateUserCache` — [caching.md](./caching.md).

Reference: `set-account-avatar-action.ts`, organization-logo siblings. Schema is 2.1.0 in `@repo/db` (`storage` PostgreSQL schema).

## Definition of done {#definition-of-done}

- [Placement](./architecture.md#placement) — right app vs package
- SSOT updated (routes, tags, labels)
- Writes via `auth.api` or `createRouterClient`; `updateTag` when the actor must see the change
- No custom access modules
- New work only in `apps/web` + core packages
