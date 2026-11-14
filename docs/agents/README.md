# Guides for contributors and agents

Each guide covers one area: how it works here, the steps to change it, and a real file to copy. [AGENTS.md](../../AGENTS.md) holds the rules that apply everywhere and says which guide to read for which change. The code is the source of truth for what exists; these pages explain how to extend it.

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
