# Caching

> Rule: `.cursor/rules/caching.mdc`

Applies to Next.js apps (`apps/web`). This app has **Cache Components** and **Partial Prefetching** on (`cacheComponents` and `partialPrefetching`).

Read Next in-repo docs first — [nextjs.md](./nextjs.md). Never web-search.

1. **Read:** `'use cache'` + `cacheTag` from segment `cache-tags.ts` + `cacheLife("minutes")`.
2. **Write:** after a successful `auth.api` / `createRouterClient` in the **same** action → `updateTag(tag)` (same builder as the read).
3. Never cache session.

| Situation                   | API                         |
| --------------------------- | --------------------------- |
| Actor must see fresh UI now | `updateTag`                 |
| Elsewhere / staleness OK    | `revalidateTag(tag, "max")` |

No bare `revalidateTag(tag)`.
