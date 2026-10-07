# apps/web — agent notes

Next.js app for this monorepo. **Cache Components** and **Partial Prefetching** are on (`cacheComponents` and `partialPrefetching` in `next.config.ts`). Repo index: [AGENTS.md](../../AGENTS.md). How-to: [docs/agents/](../../docs/agents/). Topic paths: [nextjs.md](../../docs/agents/nextjs.md).

**Before any Next.js work:** open the relevant file under `node_modules/next/dist/docs/` in **this** directory. Do **not** web-search Next.js — installed docs are the source of truth for this version.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
