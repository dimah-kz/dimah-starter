# web

Next.js app — **server-first** org dashboard, auth screens, account settings, platform admin, and storage uploads.

**Cache Components** and **Partial Prefetching** are enabled (`cacheComponents` and `partialPrefetching`). Session is read in RSC. Mutations live in Server Actions (`auth.api`). There is no `authClient` on this surface.

```bash
pnpm --filter web dev
```
