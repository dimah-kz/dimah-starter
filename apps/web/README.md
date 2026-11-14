# web

The Next.js 16 app: landing page, sign-in flows, dashboard, account settings and platform admin. Pages read the session in Server Components, every write is a Server Action in `src/app/action/`, and there is no client auth SDK.

`cacheComponents` and `partialPrefetching` are on in `next.config.ts`. For Next.js APIs, the docs that match the installed version are in `node_modules/next/dist/docs/`.

| Path                   | Holds                                                                  |
| ---------------------- | ---------------------------------------------------------------------- |
| `src/app/(marketing)/` | Public pages, `llms.txt`                                               |
| `src/app/(auth)/`      | Sign in, sign up, password reset, email verification, invitations      |
| `src/app/dashboard/`   | Signed-in area: home, account, organization management, platform admin |
| `src/app/action/`      | Server Actions, one per file, mirroring the routes                     |
| `src/app/api/`         | Mounted handlers only: Better Auth, oRPC, upload tickets               |
| `src/components/`      | UI shared across segments (`list/`, `form/`, `badge/`, …)              |
| `src/i18n/`            | next-intl request config and the locale Server Action                  |
| `e2e/`                 | Playwright tests                                                       |

```bash
pnpm --filter web dev        # http://localhost:3000
pnpm --filter web test       # Vitest: *.test.ts on Node, *.test.tsx in jsdom
pnpm --filter web test:e2e   # Playwright; starts next dev on port 3100
```

How to add pages, actions and lists: [docs/agents/](../../docs/agents/README.md).
