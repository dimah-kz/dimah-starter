# AGENTS.md

Dimah Starter is a server-first, multi-tenant SaaS starter: a pnpm + Turborepo monorepo with one Next.js app (`apps/web`) and shared packages. This file applies to every task. For the area you are changing, also read its guide in [`docs/agents/`](docs/agents/README.md).

## Stack

The installed versions are newer than most training data:

- **Next.js 16.4** (App Router, Cache Components, Partial Prefetching, Turbopack, React Compiler), **React 19.3**, **TypeScript 7** (strict)
- **Better Auth 1.7** (`organization`, `admin` plugins), **Drizzle ORM 1.0 RC** on PostgreSQL, **oRPC 2 beta**
- **next-intl 4**, **Tailwind CSS 4**, **shadcn/ui** on Base UI with **ReUI**, **dimah-s3 2 beta** for uploads
- **Vitest 5**, **Playwright**, **pnpm 12**, **Node ≥ 22**

When an API's exact behavior matters, check the installed version instead of relying on memory:

- **Next.js:** the version-matched docs in `apps/web/node_modules/next/dist/docs/`. [nextjs.md](docs/agents/nextjs.md) lists the pages this repo relies on.
- **Other packages:** their types and source in the package's `node_modules/`.

## Commands

| Task                              | Command                                                                                              |
| --------------------------------- | ---------------------------------------------------------------------------------------------------- |
| Dev server                        | `pnpm dev` → http://localhost:3000. If one is already running, use it                                |
| Checks (all packages)             | `pnpm lint` · `pnpm typecheck` · `pnpm test` · `pnpm format`                                         |
| One package                       | `pnpm --filter <name> <script>`, e.g. `pnpm --filter web typecheck`, `pnpm --filter @repo/auth test` |
| End-to-end                        | `pnpm test:e2e` (Playwright; starts `next dev` on port 3100)                                         |
| Production build                  | `pnpm build`                                                                                         |
| Migrations                        | `pnpm --filter @repo/db db:generate`, then `db:migrate`                                              |
| Auth schema after a config change | `pnpm --filter @repo/db auth:generate`, then `db:generate`                                           |
| shadcn / ReUI components          | `pnpm ui:sync`                                                                                       |
| Docs links and paths              | `pnpm docs:check`                                                                                    |

Package names: `web`, `@repo/api`, `@repo/auth`, `@repo/db`, `@repo/email`, `@repo/i18n`, `@repo/storage`, `@repo/ui`.

## Where things live

| Path                                  | Holds                                                                 |
| ------------------------------------- | --------------------------------------------------------------------- |
| `apps/web/src/app/(marketing)/`       | Public pages                                                          |
| `apps/web/src/app/(auth)/`            | Sign in, sign up, password reset, email verification, invitations     |
| `apps/web/src/app/dashboard/`         | Signed-in area: account, organization management (`manage/`), admin   |
| `apps/web/src/app/action/`            | Server Actions — every write — mirroring the route tree               |
| `apps/web/src/app/api/`               | Mounted handlers only: `/api/auth`, `/api/rpc`, `/api/s3`             |
| `apps/web/src/components/`            | App UI shared across segments (`list/`, `form/`, `badge/`, …)         |
| `packages/auth`                       | Better Auth instance, roles (`*-access.ts`), rate limits              |
| `packages/db`                         | Drizzle client, schema, migrations                                    |
| `packages/api`                        | Product procedures (oRPC), one file each                              |
| `packages/storage` · `email` · `i18n` | Upload routes and cleanup · transactional mail · messages and locales |
| `packages/ui`                         | shadcn / ReUI primitives, Dimah components, `globals.css`             |
| `tooling/`                            | Shared ESLint, TypeScript and Vitest configs                          |

## Rules

Each rule has a reason. Follow it unless the user asks for something else.

1. **Writes are Server Actions** in `apps/web/src/app/action/<segment>/`, one per file, mirroring the route. They call `auth.api.*` for users, sessions, organizations and roles, and `createRouterClient(router, …)` from `@repo/api` for product data. Better Auth checks permissions inside `auth.api`, so an action needs no pre-check of its own. Do not add Route Handlers for writes.
2. **Gate every read of private data in the page and in its `get-*.ts`.** Call `requireDashboardSession`, `requireOrganizationManager` or `requirePlatformAdmin` from `apps/web/src/app/dashboard/lib/dashboard-session.ts`, then read through a `'use cache'` function. A layout gate does not stop the page from rendering its data.
3. **No session, `headers()` or `cookies()` inside `'use cache'`.** A cached result is shared between requests, so it would serve one person's data to another. Pass ids into the cached function instead.
4. **Expire what a write changed, in the same action.** Use `updateTag(tag)` for what the actor sees next, and `revalidateTag(tag, "max")` for other people's views. Tag builders live in the segment's `cache-tags.ts`.
5. **One source of truth per segment.**
   - URLs: `*-routes.ts`
   - Cache tags: `cache-tags.ts`
   - UI text: `packages/i18n/src/messages/` in **both** `en` and `fa`

   `t("key")` is type-checked against `en`, and a test checks `fa` has the same keys and placeholders.

6. **Dependencies point from apps to packages.** Packages hold auth, data, the API, storage, mail, i18n and UI primitives. Routes, pages, actions and feature UI stay in `apps/web`. Add a new app or package only when asked.
7. **Client components stay off server packages.** In a `"use client"` file, import only:
   - `@repo/ui`, `@repo/i18n`, `@repo/storage/s3-client`, `@repo/api/client`
   - the pure `@repo/auth/*` subpaths: `role-string`, `*-access`, `password-limits`, `paths`

   The package roots open database or S3 clients and read secrets; `import type` is fine.

8. **Change generators, not generated files.** `pnpm ui:sync` overwrites `packages/ui/src/components/**` (everything except `dimah/`), and `auth:generate` / `storage:generate` overwrite `packages/db/src/schema/*.schema.ts`. To change them, edit the sync patches or the Better Auth / dimah-s3 config.
9. **Keep code where it is used.** Search for an existing helper before writing one. Extract to a new file only when a second caller needs it, or when it is a segment's routes or tags.

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

- `pnpm lint`, `pnpm typecheck` and `pnpm test` pass. While iterating, scope them with `--filter`.
- **Logic:** anything that would hurt if it broke silently (input parsing, redirects, permissions, an action's validation) has a test beside it.
- **UI and routes:** check the change in the running app. If the [`next-devtools-mcp`](docs/agents/nextjs.md#where-to-check-an-api) server is connected, `get_errors` and `compile_route` report runtime and compile errors without a full `pnpm build`.
- **Schema:** a schema change ships with its migration. CI fails without it.
- **Docs:** when you change how something works, update its guide and run `pnpm docs:check`.
