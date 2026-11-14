# Guides for contributors and agents

Each guide covers one area: how it works here, the steps to change it, and a real file to copy. Read the one for the area you are changing; [AGENTS.md](../../AGENTS.md) holds the rules that apply everywhere. The code is the source of truth for what exists — these pages explain how to extend it.

| Guide                                | Covers                                                                           |
| ------------------------------------ | -------------------------------------------------------------------------------- |
| [architecture.md](./architecture.md) | Workspace, package roles, dependency direction, file placement, naming, versions |
| [nextjs.md](./nextjs.md)             | Next.js 16.4 docs, rendering, Suspense, `'use cache'`, tags, invalidation        |
| [better-auth.md](./better-auth.md)   | Auth config, auth writes, rate limits, roles and permissions, sessions           |
| [dashboard.md](./dashboard.md)       | Dashboard pages, gates, nav registries, server-rendered lists                    |
| [api.md](./api.md)                   | Product procedures in `@repo/api` (oRPC)                                         |
| [storage.md](./storage.md)           | Upload routes, saving and removing files, purge                                  |
| [i18n.md](./i18n.md)                 | Messages, locales, right-to-left                                                 |
| [ui.md](./ui.md)                     | `@repo/ui` primitives, styling, forms                                            |
| [seo.md](./seo.md)                   | Public pages, metadata, sitemap, robots                                          |
| [testing.md](./testing.md)           | Vitest and Playwright, one reference test per kind                               |

## Copy these

| Task                  | Reference                                                                                       |
| --------------------- | ----------------------------------------------------------------------------------------------- |
| Auth write (action)   | `apps/web/src/app/action/dashboard/account/update-profile-action.ts`                            |
| Upload write (action) | `apps/web/src/app/action/dashboard/account/set-account-avatar-action.ts`                        |
| Gated, cached read    | `apps/web/src/app/dashboard/(organization)/manage/members/lib/get-organization-members-page.ts` |
| Server-rendered list  | `apps/web/src/app/dashboard/(organization)/manage/members/`                                     |
| Routes and cache tags | `apps/web/src/app/dashboard/lib/dashboard-routes.ts`, `cache-tags.ts`                           |
| Product procedure     | `packages/api/src/routers/health/ping.ts`                                                       |
| UI copy               | `packages/i18n/src/messages/en/dashboard.json` (and `fa/`)                                      |
| Tests                 | [testing.md](./testing.md)                                                                      |

Keep these pages true: when a change makes a guide wrong, fix the guide in the same change. `pnpm docs:check` (also in CI) fails when a link or a repository path in the docs points nowhere.
