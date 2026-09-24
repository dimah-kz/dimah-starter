---
description: dimah-starter monorepo — agent index; open detail only when needed
alwaysApply: true
---

# Agent guide (index)

Explore the codebase for layout, packages, and routes. Open [docs/agents/](docs/agents/) only when **adding or changing** a feature.

**Next.js:** **Cache Components** is on (`cacheComponents: true`). Training data is outdated. Before any Next API or pattern, **Read** docs under `apps/web` → `node_modules/next/dist/docs/`. **Never web-search** Next.js. Managed warning + resolve path: [apps/web/AGENTS.md](apps/web/AGENTS.md). Topic index: [nextjs.md](docs/agents/nextjs.md).

## Workflow

1. Touch a file → matching [.cursor/rules/\*.mdc](.cursor/rules/) applies.
2. Adding/changing a feature → **Read** the relevant guide in [docs/agents/](docs/agents/) ([README](docs/agents/README.md)).
3. New file? Search upward first — [architecture.md § Placement](docs/agents/architecture.md#placement).
4. Unsure which app/package → [monorepo.md](docs/agents/monorepo.md).
5. Done? — [implementation.md § Definition of done](docs/agents/implementation.md#definition-of-done).

## Non-negotiables

- **Packages → apps**, never apps → packages for app-specific UI or routes.
- Inline by default; ~10–20 lines → no new file.
- Writes: app `action/` → **`auth.api`** (auth) or **`createRouterClient`** from `@repo/api` (product) — no custom access modules, no direct auth-table deletes.
- SSOT inside each app segment: `*-routes.ts`, `cache-tags.ts`; UI copy in `@repo/i18n` messages.
- Session: `auth.api.getSession` (`Session` from `@repo/auth`); never cache session.
- Same-user writes: `updateTag` in the mutating action.
- Do not hand-edit `@repo/ui` shadcn/ReUI components for durable fixes — regen via `pnpm ui:sync`. Dimah items: edit `packages/ui/src/components/dimah` in place.
- **Do not add new features outside `apps/web` + core packages.**

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
