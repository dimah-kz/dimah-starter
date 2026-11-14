# AGENTS.md

A server-first, multi-tenant SaaS built on Dimah Starter: a pnpm + Turborepo monorepo with one Next.js app (`apps/web`) and shared packages in `packages/`. This file applies to every task. For the area you change, also read its guide in [`docs/agents/`](docs/agents/README.md).

## Versions

Next.js 16 (Cache Components, Partial Prefetching), React 19, Better Auth 1, Drizzle ORM 1, oRPC 2, Tailwind CSS 4, shadcn/ui on Base UI, Vitest 5. These majors are newer than most training data, and their APIs changed. Exact versions are in `pnpm-workspace.yaml` (`catalog`) and each `package.json`.

When an API's behavior matters, check the installed version instead of memory:

- **Next.js:** the version-matched docs in `apps/web/node_modules/next/dist/docs/` ([nextjs.md](docs/agents/nextjs.md)).
- **Other packages:** their types and source in `node_modules/`.

## Commands

| Task                              | Command                                                               |
| --------------------------------- | --------------------------------------------------------------------- |
| Dev server                        | `pnpm dev` → http://localhost:3000. If one is already running, use it |
| Checks                            | `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm format`          |
| One package                       | `pnpm --filter <name> <script>`, e.g. `pnpm --filter web typecheck`   |
| End-to-end                        | `pnpm test:e2e` (Playwright; starts `next dev` on port 3100)          |
| Production build                  | `pnpm build`                                                          |
| Migrations                        | `pnpm --filter @repo/db db:generate`, then `db:migrate`               |
| Auth schema after a config change | `pnpm --filter @repo/db auth:generate`, then `db:generate`            |
| shadcn / ReUI components          | `pnpm ui:sync`                                                        |
| Docs links and paths              | `pnpm docs:check`                                                     |

Packages are `web` and `@repo/<folder name>`.

## Rules

Each rule has a reason. Follow it unless the user asks for something else.

1. **Writes are Server Actions.** Put them in `apps/web/src/app/action/<segment>/`, one per file, mirroring the route.
   - They call `auth.api.*` for users, sessions, organizations and roles, and `createRouterClient` from `@repo/api` for product data.
   - `auth.api` checks permissions itself, so an action adds no pre-check.
   - Don't add Route Handlers for writes. Server Actions get Next.js's origin check against cross-site requests, and their cache updates show in the same response.
   - `apps/web/src/app/api/` only mounts Better Auth, oRPC and upload tickets.
2. **Gate every read of private data in the page and in its `get-*.ts`.** Call `requireDashboardSession`, `requireOrganizationManager` or `requirePlatformAdmin` from `apps/web/src/app/dashboard/lib/dashboard-session.ts`, then read through a `'use cache'` function. A layout gate does not keep a page's data out of its response.
3. **No session, `headers()` or `cookies()` inside `'use cache'`.** A cached result is shared between requests, so it would serve one person's data to another. Pass ids in instead.
4. **Expire what a write changed, in the same action.** Use `updateTag(tag)` for what the actor sees next, and `revalidateTag(tag, "max")` for other people's views, with tags from the segment's `cache-tags.ts`.
5. **One source of truth.**
   - URLs: `*-routes.ts`
   - Cache tags: `cache-tags.ts`
   - UI text: `packages/i18n/src/messages/`, in every locale

   Hardcoded paths and strings drift. `t("key")` is type-checked, and a test catches a locale missing a key.

6. **Dependencies point from apps to packages.**
   - Packages hold auth, data, the API, storage, mail, i18n and UI primitives.
   - Routes, pages, actions and feature UI stay in `apps/web`.
   - Add an app or package only when asked.
7. **Client components stay off server packages.** In a `"use client"` file, import only:
   - `@repo/ui`, `@repo/i18n`, `@repo/storage/s3-client`, `@repo/api/client`
   - the pure `@repo/auth/*` subpaths: `role-string`, `*-access`, `password-limits`, `paths`

   The other package roots open database or S3 clients and read secrets. `import type` is fine.

8. **Change generators, not generated files.**
   - `pnpm ui:sync` rewrites `packages/ui/src/components/**` (everything except `dimah/`).
   - `auth:generate` and `storage:generate` rewrite `packages/db/src/schema/*.schema.ts`.

   Edit the sync patches or the Better Auth / dimah-s3 config instead.

9. **Reuse before you add.** Search for an existing helper first. A new file is for code a second caller needs, or for a segment's routes or tags.

## Which guide to read

| You are changing                                         | Guide                                          |
| -------------------------------------------------------- | ---------------------------------------------- |
| Where a file goes, packages, dependencies, naming        | [architecture.md](docs/agents/architecture.md) |
| Rendering, Suspense, `'use cache'`, tags, Next.js APIs   | [nextjs.md](docs/agents/nextjs.md)             |
| Sign-in, sessions, roles, permissions, rate limits, mail | [better-auth.md](docs/agents/better-auth.md)   |
| A dashboard page, its nav entry, a server-rendered list  | [dashboard.md](docs/agents/dashboard.md)       |
| Product procedures (oRPC)                                | [api.md](docs/agents/api.md)                   |
| Uploads, avatars, logos                                  | [storage.md](docs/agents/storage.md)           |
| Copy, locales, right-to-left                             | [i18n.md](docs/agents/i18n.md)                 |
| Components and styling                                   | [ui.md](docs/agents/ui.md)                     |
| Public pages, metadata, sitemap                          | [seo.md](docs/agents/seo.md)                   |
| Tests                                                    | [testing.md](docs/agents/testing.md)           |

## Check your work

- **Checks:** `pnpm lint`, `pnpm typecheck` and `pnpm test` pass. Scope them with `--filter` while iterating.
- **Tests:** logic that would hurt if it broke silently (input parsing, redirects, permissions, an action's validation) has a test beside it.
- **Running app:** UI and route changes are checked there. If the [`next-devtools-mcp`](docs/agents/nextjs.md#where-to-check-an-api) server is connected, `get_errors` and `compile_route` report errors without a full `pnpm build`.
- **Schema:** a schema change ships with its migration.
- **Docs:** when a change makes a guide wrong, fix the guide and run `pnpm docs:check`.
