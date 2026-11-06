# dimah-starter

A **server-first Turborepo starter** for multi-tenant SaaS — Next.js dashboard, Better Auth, Postgres, and [dimah-s3](https://s3.dimah.dev) storage. Shared packages are ready for a mobile or extension app later.

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
│   ├── email/               # Resend transactional email
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
cp .env.example .env          # DATABASE_URL, BETTER_AUTH_*, DIMAH_S3_SECRET, optional GOOGLE_*, S3_*, RESEND_*, EMAIL_FROM
pnpm --filter @repo/db db:migrate
pnpm dev
```

→ [http://localhost:3000](http://localhost:3000)

**First platform admin.** Sign up, verify the email (without `RESEND_API_KEY` the link is printed to the server log), then grant the role once:

```sql
UPDATE auth."user" SET role = 'admin' WHERE email = 'you@example.com';
```

Sign in again to see **Platform management** in the sidebar. Later admins are promoted from `/dashboard/admin/users`.

| Command                                              | What it does                                    |
| ---------------------------------------------------- | ----------------------------------------------- |
| `pnpm dev`                                           | Run the web app                                 |
| `pnpm format:check` · `lint` · `typecheck` · `build` | Quality gates (CI runs all of them)             |
| `pnpm --filter @repo/db db:generate` · `db:migrate`  | Create and apply migrations                     |
| `pnpm --filter @repo/db db:studio`                   | Browse the database                             |
| `pnpm ui:sync`                                       | Regenerate shadcn / ReUI components             |
| `pnpm storage:purge`                                 | Clean up abandoned uploads (schedule it hourly) |

## Included vs add when you need it

Ships with email/password and Google sign-in, email verification, password reset, organizations, members, invitations, platform admin, avatar and logo uploads, a landing page, and English/Persian with RTL.

Google appears when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set. Product oRPC is a `health.ping` stub in `@repo/api` (`src/routers/health/`) — add procedures there, then call them from Server Actions with `createRouterClient`.

## Production

- **Trusted origins** — `http://localhost:3000` is trusted only outside production. Set `BETTER_AUTH_URL` to the public origin.
- **Postgres on serverless** — use a **pooled** `DATABASE_URL` (Neon pooler, PgBouncer, Supabase pooler). Direct `5432` will exhaust connections under bursty functions.
- **Session cookie cache** — `getSession` may use a cookie for up to **5 minutes**. After a ban or role change, the affected user can still look signed-in until that cache expires.
- **Auth rate limit** — counters live in Postgres so they survive serverless. Better Auth limits its HTTP routes (`/api/auth`); the sign-in, sign-up and password-reset Server Actions call `consumeRateLimit` first. Behind more than one proxy, set Better Auth `advanced.ipAddress` so the client IP is right.
- **Security headers** — `next.config.ts` denies framing and sets `nosniff`, `Referrer-Policy`, `Permissions-Policy` and, in production, HSTS. Add a script CSP if you need one.
- **SEO** — canonicals, `sitemap.xml`, `robots.txt`, and the share image use `BETTER_AUTH_URL`. Set `GOOGLE_SITE_VERIFICATION`, then submit `/sitemap.xml` in Search Console. Public pages go in `apps/web/src/app/(marketing)/` — [seo.md](./docs/agents/seo.md).
- **Email** — set `RESEND_API_KEY` and `EMAIL_FROM` in production. Without a key, development prints the message (including the link) to the server log.
- **Storage** — allow `GET`, `PUT`, and `HEAD` from your origin in the bucket CORS, serve objects at `S3_PUBLIC_BASE_URL`, and schedule `pnpm storage:purge` hourly so uploads that never confirm leave the bucket and the database — [packages/storage](./packages/storage/README.md#purging-stale-uploads).

Conventions: [`AGENTS.md`](./AGENTS.md). MIT — see [LICENSE](./LICENSE).
