# Implementation

> Rule: `.cursor/rules/implementation.mdc`

Server Components by default. `"use client"` only for interactivity.

Mutations: `app/action/<segment>/` mirrors the route — validate → `auth.api` or `createRouterClient` → `updateTag` if the actor must see the change. [api.md](./api.md)

Suspense only around slices that call request APIs (`headers`, `cookies`) or read URL data (`params`, `searchParams`). Cached shells stay outside.

Next.js APIs: read `apps/web/node_modules/next/dist/docs/` first — [nextjs.md](./nextjs.md). Never web-search.

## Session {#auth--session}

| Helper                 | When                                           |
| ---------------------- | ---------------------------------------------- |
| `auth.api.getSession`  | Read / route gate — `headers: await headers()` |
| `auth.api` + `headers` | Mutations and permission checks                |

Never put session in `'use cache'`. `React.cache()` around `getSession` is request-scoped memoization and is OK. Do not gate before `auth.api`. Client components must not import `@repo/auth`.

Server Components may render a Context imported from a `'use client'` module (no empty Provider wrapper). Do not invent a Context only to use that API.

Transient overlays: close them in `useLayoutEffect` cleanup so Cache Components `<Activity>` hide does not restore an open sheet.

Cookie cache (5 min) can lag ban/role changes — [better-auth.md](./better-auth.md).

## Storage uploads {#storage-uploads}

`@repo/storage` owns `dimahS3({ routes })`. App actions persist URLs and cache. To add a kind of file, add a named route — do not invent a key helper.

1. Client: `useUpload({ route: "avatars", uploadOptions: { metadata: { ownerKind } } })`. Omit `accept` / `maxFileSize` (catalog).
2. The route's `object()` scopes the key (`{kind}/{id}` under the route prefix). Constraints live on the route. Guards throw `errors.*` (better-call `APIError`). Detect with `isAPIError` / `isS3ErrorCode` — not `DimahS3Error`.
3. Before persist, check the key sits under `avatars/{kind}/{id}`. `toPublicUrl(key)` for the stored URL.
4. Persist via **`auth.api`** — not a direct auth-table write.
5. On remove, `fromPublicUrl` + `s3.api.delete({ query: { route, key } })`.
6. `updateTag` / `invalidateUserCache` — [caching.md](./caching.md).

Reference: `set-account-avatar-action.ts`, organization-logo siblings.

## Definition of done {#definition-of-done}

- [Placement](./architecture.md#placement) — right app vs package
- SSOT updated (routes, tags, labels)
- Writes via `auth.api` or `createRouterClient`; `updateTag` when the actor must see the change
- No custom access modules
- New work only in `apps/web` + core packages
