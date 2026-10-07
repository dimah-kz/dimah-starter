# dimah-starter

A **server-first Turborepo starter** for multi-tenant SaaS — Next.js dashboard, Better Auth, Postgres, and [dimah-s3](https://dimah-s3.vercel.app) storage. Shared packages are ready for a mobile or extension app later.

The product surface is server-first, not just login: session in RSC, lists from tagged cache, writes (auth, orgs, uploads) as Server Actions. No `authClient` and no client data layer in the UI.

**[Use this template](https://github.com/dimah-kz/dimah-starter/generate)**

## Why server-first

| Typical SaaS kit                         | This starter                              |
| ---------------------------------------- | ----------------------------------------- |
| Client SDK + React Query / providers     | RSC session via `auth.api.getSession`     |
| Client mutations, then refetch           | Server Actions → `auth.api` → `updateTag` |
| Drop-in widgets for auth, storage, menus | Your chrome: sidebar, org switcher, menus |
| Copy and locale owned by the kit         | `@repo/i18n` + RTL from day one           |

## Cache Components

`apps/web` runs the Next.js 16.4 Cache Components model (`cacheComponents: true` and `partialPrefetching: true` in `next.config.ts`). That is framework config, not an extra library.

- Cached reads: `'use cache'` + `cacheTag` + `cacheLife` in `get-*.ts`
- Same-user writes: `updateTag` in the mutating Server Action
- Session is never cached

## Structure

```
dimah-starter/
├── apps/
│   └── web/                 # Next.js product (dashboard, auth, admin)
├── packages/
│   ├── api/                 # Product oRPC (caller + /api/rpc)
│   ├── auth/                # Better Auth server
│   ├── db/                  # Drizzle schema, client, migrations
│   ├── storage/             # dimah-s3 storage
│   ├── i18n/                # UI messages & locale
│   └── ui/                  # shadcn / ReUI / Dimah
├── tooling/
│   ├── eslint-config/
│   └── typescript-config/
└── docs/agents/             # Contributor / agent guides
```

`apps/mobile` and `apps/extension` are reserved slots — share through packages, not across apps.

## Quick start

Node ≥ 22 · pnpm 12 · PostgreSQL · dimah-s3 storage (S3-compatible bucket, e.g. R2)

```bash
pnpm install
cp .env.example .env          # DATABASE_URL, BETTER_AUTH_*, S3_*
pnpm --filter @repo/db db:migrate
pnpm dev                     # web + db
```

→ [http://localhost:3000](http://localhost:3000)

| Command                             | What it does     |
| ----------------------------------- | ---------------- |
| `pnpm --filter web dev`             | Run the web app  |
| `pnpm build` / `lint` / `typecheck` | Quality gates    |
| `pnpm --filter @repo/db db:migrate` | Apply migrations |

## Included vs add when you need it

Ships with email/password sign-in and sign-up, organizations, members, platform admin, and S3 uploads.

Not in the UI (add from this template when the product needs them): password reset, email verification, OAuth, org invitations. The Better Auth `invitation` table is generated with the rest of the schema. Product oRPC is a `health.ping` stub in `@repo/api` — add procedures there, then call them from Server Actions with `createRouterClient`.

## Production

- **Trusted origins** — `http://localhost:3000` is trusted only outside production. Set `BETTER_AUTH_URL` to the public origin.
- **Postgres on serverless** — use a **pooled** `DATABASE_URL` (Neon pooler, PgBouncer, Supabase pooler). Direct `5432` will exhaust connections under bursty functions.
- **Session cookie cache** — `getSession` may use a cookie for up to **5 minutes**. After a ban or role change, the affected user can still look signed-in until that cache expires.
- **Auth rate limit** — counters live in Postgres so they survive serverless. That limiter applies to Better Auth HTTP routes (`/api/auth` if you mount it), not Server Actions.

Conventions: [`AGENTS.md`](./AGENTS.md). MIT — see [LICENSE](./LICENSE).
