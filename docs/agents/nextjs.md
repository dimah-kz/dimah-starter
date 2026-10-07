# Next.js 16+

> Rule: `.cursor/rules/nextjs.mdc` · managed warning: [apps/web/AGENTS.md](../../apps/web/AGENTS.md)

This app uses the Next.js 16.4 Cache Components model: `cacheComponents: true` and `partialPrefetching: true`.

1. Open the matching file under `apps/web/node_modules/next/dist/docs/` **before** writing Next.js code.
2. Never web-search Next.js.
3. Then apply this repo’s choices — [caching.md](./caching.md).

If a path is missing, search that `docs/` tree. Do not fall back to the web.

Paths below are relative to `node_modules/next/dist/docs/` (from `apps/web`).

| Topic                                    | Path                                                                                  |
| ---------------------------------------- | ------------------------------------------------------------------------------------- |
| Cache Components                         | `01-app/03-api-reference/05-config/01-next-config-js/cacheComponents.md`              |
| Partial Prefetching                      | `01-app/03-api-reference/05-config/01-next-config-js/partialPrefetching.md`           |
| `'use cache'` / `cacheTag` / `updateTag` | `01-app/03-api-reference/01-directives/use-cache.md`, `04-functions/cacheTag.md`      |
| `navigation()` / `prefetch()`            | `01-app/03-api-reference/04-functions/navigation.md`, `04-functions/prefetch.md`      |
| `ensureStatic`                           | `01-app/03-api-reference/03-file-conventions/02-route-segment-config/ensureStatic.md` |
| Revalidating                             | `01-app/01-getting-started/09-revalidating.md`                                        |
| Server Actions                           | `01-app/01-getting-started/07-mutating-data.md`                                       |
| Suspense                                 | `01-app/02-guides/streaming.md`                                                       |
| Activity / preserved UI                  | `01-app/02-guides/preserving-ui-state.md`                                             |
| `error.js`                               | `01-app/03-api-reference/03-file-conventions/error.md`                                |
| `not-found.js`                           | `01-app/03-api-reference/03-file-conventions/not-found.md`                            |

React 19.3 (this app): `use(browser())` from `react-dom` for UI the server cannot produce. `useEffectEvent` for non-reactive Effect logic. Do not put session in `'use cache'`.

Dashboard and auth routes stay request-time. Do not export `ensureStatic = "navigation"` on a layout that reads the session. `params` and `searchParams` stay inside `<Suspense>`. Reach for `navigation()` or `prefetch()` only when a subtree must stay out of the shared shell or a per-link prefetch.
