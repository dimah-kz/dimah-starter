# Next.js and caching

Read when you change rendering, Suspense boundaries, cached reads, cache invalidation, or use a Next.js API.

`apps/web` runs Next.js 16.4 with `cacheComponents: true` and `partialPrefetching: true`. Much of what models remember about App Router caching does not apply here: `fetch` cache options, `export const revalidate` / `dynamic` / `fetchCache`, `unstable_cache`, `unstable_noStore`. `01-app/02-guides/migrating-to-cache-components.md` maps each one to its replacement.

## Where to check an API

1. **Bundled docs**, version-matched: `apps/web/node_modules/next/dist/docs/`. The table below lists the pages this repo relies on; search that tree for others.
2. **Error pages** from the dev overlay or build output (`https://nextjs.org/docs/messages/<code>`) are not bundled. Fetch the page's `.md` URL.
3. **The running app:** `next dev` serves an MCP endpoint at `/_next/mcp`. With the `next-devtools-mcp` server connected to your agent, `get_errors` returns the current runtime and build errors, and `compile_route` compiles one route without `pnpm build`. Setup is a one-time choice per machine: `npx add-mcp next-devtools-mcp@latest`, or see `01-app/02-guides/mcp.md`.

Blog posts and answers written for Next.js 13–15 describe a different caching model; don't build on them.

| Topic                                  | Page under `node_modules/next/dist/docs/`                                                                     |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| Cache Components                       | `01-app/03-api-reference/05-config/01-next-config-js/cacheComponents.md`                                      |
| Partial Prefetching                    | `01-app/03-api-reference/05-config/01-next-config-js/partialPrefetching.md`                                   |
| `'use cache'`, `cacheTag`, `cacheLife` | `01-app/03-api-reference/01-directives/use-cache.md`, `04-functions/cacheTag.md`, `04-functions/cacheLife.md` |
| `updateTag`, `refresh`, `io`           | `01-app/03-api-reference/04-functions/updateTag.md`, `refresh.md`, `io.md`                                    |
| Revalidating                           | `01-app/01-getting-started/09-revalidating.md`                                                                |
| Server Actions                         | `01-app/01-getting-started/07-mutating-data.md`                                                               |
| Suspense and streaming                 | `01-app/02-guides/streaming.md`                                                                               |
| Instant navigation, `instant()` tests  | `01-app/02-guides/instant-navigation.md`                                                                      |
| Preserved UI (`<Activity>`)            | `01-app/02-guides/preserving-ui-state.md`                                                                     |
| `error.js`, `not-found.js`             | `01-app/03-api-reference/03-file-conventions/error.md`, `not-found.md`                                        |
| Metadata and share images              | `01-app/01-getting-started/14-metadata-and-og-images.md`                                                      |

## Rendering

- **Server Components by default.** Add `"use client"` only for state, effects or browser APIs, as low in the tree as possible.
- **Request data inside `<Suspense>`.** Code that reads `params`, `searchParams`, `cookies()`, `headers()` or the session sits inside a `<Suspense>` boundary. Cached reads and static UI stay outside it, so they land in the prerendered shell.
- **Locale streams the whole tree.** The locale comes from a cookie (`apps/web/src/i18n/request.ts` reads it with `"use cache: private"`), so the root layout streams everything inside one `<Suspense>`.
  - A direct visit shows the root fallback first.
  - A client navigation renders the next page's prefetched App Shell.
- **Fallbacks can carry real UI.** The auth pages use their own form as the fallback, so the form is in the shell.
- **Auth and dashboard routes are request-time.** Do not export `ensureStatic = "navigation"` from a layout that reads the session.
- **Overlays close on hide.** Cache Components keeps hidden routes in React `<Activity>`, which preserves state. Close sheets and dialogs in a `useLayoutEffect` cleanup so they are not open again when the route returns.
- **Browser-only UI:** React 19.3's `use(browser())` from `react-dom` suspends until the browser — see `apps/web/src/components/theme/theme-switch-item.tsx`. `useEffectEvent` is for non-reactive logic in effects.

## Session at render time

Use `auth.api.getSession({ headers: await dashboardAuthHeaders() })`, or the gates in `apps/web/src/app/dashboard/lib/dashboard-session.ts`, which already do. `dashboardAuthHeaders()` awaits `io()` before `headers()`: Better Auth checks expiry with `Date.now()`, and Partial Prefetching rejects a clock read before the dynamic stage. Server Actions use `await headers()` directly. `React.cache()` around a session read is request-scoped and fine.

## Cached reads

```ts
export async function getAccountProfile(userId: string) {
  "use cache"
  cacheLife("minutes")
  cacheTag(dashboardCacheTags.userProfileById(userId))
  return db.select(/* … */).from(user).where(eq(user.id, userId))
}
```

- **Arguments are the cache key.** Pass ids that came from the gate or the session.
- **The function runs without the request.** It cannot call `headers()`, `cookies()` or `getSession`, and a translated string inside it gets cached for one locale. Return data or message keys, and translate in the component.
- **Tags come from builders.** Every tag comes from the segment's `cache-tags.ts` (`apps/web/src/app/dashboard/lib/cache-tags.ts`), so a read and the writes that expire it use the same string.
- **Private data needs a gate.** The `get-*.ts` that reads private data calls its gate first, then the cached function — [dashboard.md](./dashboard.md).

## After a write

In the Server Action, after `auth.api` or the router client succeeded:

| Who must see the change                        | Call                        |
| ---------------------------------------------- | --------------------------- |
| The person who acted, in this response         | `updateTag(tag)`            |
| Everyone else (admin lists, other members)     | `revalidateTag(tag, "max")` |
| Request-scoped data with no tag (session list) | `refresh()`                 |

`updateTag`, `refresh()` and a cookie set by Better Auth's `nextCookies()` re-render the current route in the action's response, so the client does not call `router.refresh()`. Work that must not delay the response, like deleting replaced files, goes in `after(() => …)`.

The reference action is `apps/web/src/app/action/dashboard/account/set-account-avatar-action.ts`.
