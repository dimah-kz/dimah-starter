# Agent documentation

How-to pages — **not** a map of the repo. Explore code for what exists. Read a page here only when **adding or changing** that topic.

| Page                                     | When                                           |
| ---------------------------------------- | ---------------------------------------------- |
| [monorepo.md](./monorepo.md)             | Workspace roles, new package                   |
| [architecture.md](./architecture.md)     | Where a file belongs, SSOT, naming             |
| [api.md](./api.md)                       | Product oRPC in `@repo/api`                    |
| [better-auth.md](./better-auth.md)       | Auth config, mutations, permissions            |
| [dashboard.md](./dashboard.md)           | Dashboard route, nav, server lists             |
| [implementation.md](./implementation.md) | RSC, session, uploads, done checklist          |
| [caching.md](./caching.md)               | Tagged cache (after Next in-repo docs)         |
| [nextjs.md](./nextjs.md)                 | Always `apps/web/node_modules/next/dist/docs/` |
| [ui-design.md](./ui-design.md)           | `@repo/ui`, logical Tailwind                   |
| [i18n.md](./i18n.md)                     | Messages, locale, RTL                          |
| [seo.md](./seo.md)                       | Metadata, sitemap, public pages                |

Skip these pages for a one-line bugfix, a “where is X?” grep, or a rename — the matching `.cursor/rules/*.mdc` is enough.

## Copy these

| Task        | Reference                                                                  |
| ----------- | -------------------------------------------------------------------------- |
| Mutation    | `apps/web/src/app/action/dashboard/account/set-account-avatar-action.ts`   |
| Cached read | `apps/web/src/app/dashboard/account/lib/get-account-profile.ts`            |
| Routes      | `apps/web/src/app/dashboard/lib/dashboard-routes.ts`                       |
| Cache tags  | `apps/web/src/app/dashboard/lib/cache-tags.ts`                             |
| UI copy     | `packages/i18n/src/messages/en/dashboard.json`                             |
| Server list | `…/members/components/members-table.tsx` + `members-columns.tsx` + `list/` |

Entry: [AGENTS.md](../../AGENTS.md) · Next managed block: [apps/web/AGENTS.md](../../apps/web/AGENTS.md)
