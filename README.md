# Dimah Starter

**Server-first Next.js 16 starter for multi-tenant SaaS.** Sign-in, organizations, an admin panel, uploads and English/Persian (RTL) work from the first run.

[![CI](https://github.com/dimah-kz/dimah-starter/actions/workflows/ci.yml/badge.svg)](https://github.com/dimah-kz/dimah-starter/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)

**[Live demo](https://starter.dimah.dev)** · **[Use this template](https://github.com/dimah-kz/dimah-starter/generate)** · [Stack](#stack) · [Features](#features) · [How it works](#how-it-works) · [Structure](#project-structure) · [Quick start](#quick-start) · [Deploy](#deploy)

[![Dimah Starter — a server-first starter for multi-tenant SaaS](./.github/assets/cover.png)](https://starter.dimah.dev)

## Stack

|             |                                                                                                                                                                      |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **App**     | [Next.js 16](https://nextjs.org), React 19, React Compiler, Cache Components                                                                                         |
| **Auth**    | [Better Auth](https://www.better-auth.com)                                                                                                                           |
| **Data**    | [Drizzle ORM](https://orm.drizzle.team), PostgreSQL                                                                                                                  |
| **API**     | [oRPC](https://orpc.dev)                                                                                                                                             |
| **UI**      | [Tailwind CSS 4](https://tailwindcss.com), [shadcn/ui](https://ui.shadcn.com), [ReUI](https://reui.io), [Base UI](https://base-ui.com), [Lucide](https://lucide.dev) |
| **i18n**    | [next-intl](https://next-intl.dev)                                                                                                                                   |
| **Email**   | [Resend](https://resend.com), [React Email](https://react.email)                                                                                                     |
| **Uploads** | [dimah-s3](https://s3.dimah.dev)                                                                                                                                     |
| **Theme**   | [next-themes](https://github.com/pacocoursey/next-themes)                                                                                                            |
| **SEO**     | [Takumi](https://takumi.kane.tw)                                                                                                                                     |
| **Tests**   | [Vitest](https://vitest.dev), [Playwright](https://playwright.dev), Testing Library                                                                                  |
| **Repo**    | pnpm, [Turborepo](https://turbo.build), TypeScript, ESLint, Prettier                                                                                                 |

## Features

| Area              | What you get                                                                       |
| ----------------- | ---------------------------------------------------------------------------------- |
| **Auth**          | Email and password, Google, passkeys, two-factor, email verification, rate limits  |
| **Organizations** | Create and switch, invite by email, owner / admin / member, logo                   |
| **Admin**         | Search users, ban, platform roles, all organizations                               |
| **Account**       | Profile, avatar, email and password, connected accounts, sessions, theme, language |
| **Uploads**       | Browser to bucket, quotas, cleanup of abandoned files                              |
| **i18n**          | English and Persian, right-to-left                                                 |
| **API**           | Typed procedures for your domain                                                   |
| **SEO**           | Metadata, share images (including Persian), sitemap, robots, JSON-LD               |
| **Quality**       | Lint, typecheck, unit tests, end-to-end tests, CI                                  |

## How it works

There is no auth client, no React Query and no client-side data layer. The server owns sessions, permissions and data:

- **Read:** a Server Component checks the session and permission on every request, then reads through a `'use cache'` function tagged per user or organization. Sessions are never cached.
- **Write:** a Server Action calls `auth.api` (users, organizations, roles) or the oRPC router (your product), then `updateTag`, so the person who acted sees fresh data in the same response.
- **Upload:** the browser sends the file straight to the bucket with a signed ticket. The action saves the URL and deletes the old file after the response.

```ts
// Read: check access on every request, then a cached, tagged query
export async function getOrganizationMembersPage(query) {
  const { organizationId } = await requireOrganizationManager()
  return getCachedPage(organizationId, query)
}

async function getCachedPage(organizationId, query) {
  "use cache"
  cacheLife("minutes")
  cacheTag(tags.organizationMembersById(organizationId))
  return db.select().from(member) // …
}

// Write: a Server Action that expires exactly what it changed
export async function removeOrganizationMemberAction(input) {
  await auth.api.removeMember({ headers: await headers(), body })
  updateTag(tags.organizationMembersById(input.organizationId))
}
```

Partial Prefetching is on as well: links prefetch the next page's shell, so navigation shows it at once while signed-in data streams in. The caching rules are in [nextjs.md](./docs/agents/nextjs.md).

## Project structure

```
dimah-starter
├── apps
│   └── web                   # Next.js 16, React 19, React Compiler
│       ├── src/app
│       │   ├── (marketing)   # landing, SEO
│       │   ├── (auth)        # sign-in, sign-up
│       │   ├── dashboard     # tenant, admin
│       │   └── action        # Server Actions
│       └── next.config.ts
├── packages
│   ├── auth                  # Better Auth
│   ├── db                    # Drizzle ORM, PostgreSQL
│   ├── api                   # oRPC
│   ├── storage               # dimah-s3
│   ├── email                 # Resend, React Email
│   ├── i18n                  # next-intl
│   └── ui                    # Tailwind CSS 4, shadcn/ui, ReUI, Base UI
├── tooling                   # ESLint, TypeScript, Vitest
├── docs/agents
├── pnpm-workspace.yaml
└── turbo.json                # Turborepo
```

Imports point one way: `apps/` uses `packages/`, never the reverse. A second app (mobile, extension) goes in `apps/` and reuses the same packages.

## Quick start

You need Node.js 22.12+, pnpm 12 and a PostgreSQL database.

```bash
git clone https://github.com/dimah-kz/dimah-starter.git my-saas
cd my-saas
pnpm install
cp .env.example .env                # set DATABASE_URL and BETTER_AUTH_SECRET
pnpm --filter @repo/db db:migrate   # create the tables
pnpm dev                            # http://localhost:3000
```

Open the app and sign up. Until you add a Resend key, verification and reset emails are printed in the terminal running `pnpm dev`.

### Environment variables

Only the first two are needed to run locally. Each one is explained in [`.env.example`](./.env.example).

| Variable                                   | Used for                                                                           |
| ------------------------------------------ | ---------------------------------------------------------------------------------- |
| `DATABASE_URL`                             | **Required.** PostgreSQL connection string                                         |
| `BETTER_AUTH_SECRET`                       | **Required.** Signs sessions; 32+ characters (`openssl rand -base64 32`)           |
| `BETTER_AUTH_URL`                          | Public URL of the app. Defaults to `http://localhost:3000`; required in production |
| `RESEND_API_KEY`, `EMAIL_FROM`             | Sending email                                                                      |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | Google sign-in                                                                     |
| `DIMAH_S3_SECRET`, `S3_*`                  | Uploads (avatars, organization logos) to R2, S3 or MinIO                           |
| `GOOGLE_SITE_VERIFICATION`                 | Google Search Console                                                              |

<details>
<summary>Make yourself platform admin</summary>

After you sign up and verify your email, run this once against your database:

```sql
UPDATE auth."user" SET role = 'admin' WHERE email = 'you@example.com';
```

Sign in again and **Platform management** appears in the sidebar. Promote later admins from `/dashboard/admin/users`.

</details>

## Scripts

```bash
pnpm dev                              # start the app on http://localhost:3000
pnpm build                            # production build
pnpm lint                             # ESLint
pnpm typecheck                        # TypeScript
pnpm test                             # unit tests (Vitest)
pnpm test:e2e                         # end-to-end tests (Playwright, port 3100)
pnpm format                           # format with Prettier
pnpm --filter @repo/db db:generate    # create a migration from schema changes
pnpm --filter @repo/db db:migrate     # apply migrations
pnpm --filter @repo/db db:studio      # browse the database
pnpm ui:sync                          # regenerate shadcn/ui and ReUI components
pnpm storage:purge                    # delete abandoned uploads (run it hourly)
```

CI runs format, lint, typecheck, unit tests, the build and end-to-end tests on every pull request and push to `main`, and fails when a schema change has no migration.

## Make it yours

**Rebrand** — these files still describe this starter:

| Change                        | In                                                                             |
| ----------------------------- | ------------------------------------------------------------------------------ |
| App name and description      | `packages/i18n/src/messages/en/common.json` and the other locales              |
| Colors                        | `packages/ui/src/styles/globals.css`, `apps/web/src/components/og/og-card.tsx` |
| Landing page, FAQ, `llms.txt` | `apps/web/src/app/(marketing)/`, with copy in `marketing.json`                 |
| GitHub links, author          | `apps/web/src/lib/site.ts`                                                     |
| Repository files              | `package.json`, `README.md`, `CONTRIBUTING.md`, `SECURITY.md`, `LICENSE`       |

**Add features** — each guide shows a real file to copy:

| To add       | Start from                                                                | Guide                                                 |
| ------------ | ------------------------------------------------------------------------- | ----------------------------------------------------- |
| A page       | a sibling folder in `apps/web/src/app/dashboard/`                         | [dashboard.md](./docs/agents/dashboard.md)            |
| A write      | a Server Action in `apps/web/src/app/action/`, mirroring the page's route | [better-auth.md](./docs/agents/better-auth.md#writes) |
| Domain logic | one oRPC procedure per file in `packages/api/src/routers/`                | [api.md](./docs/agents/api.md)                        |
| A table      | a Drizzle schema in `packages/db/src/schema/`, then `db:generate`         | [packages/db](./packages/db/README.md)                |
| A test       | a `*.test.ts` beside the code, or a spec in `apps/web/e2e/`               | [testing.md](./docs/agents/testing.md)                |

## Guides

[`docs/agents/`](./docs/agents) has one short guide per area: how it works here, the steps to change it and a file to copy. Claude Code, Codex, Cursor and Copilot read [`AGENTS.md`](./AGENTS.md), which holds the rules and points them to the right guide. With the [Next.js MCP server](./docs/agents/nextjs.md#where-to-check-an-api) connected, they can also read the running app's errors.

[Architecture](./docs/agents/architecture.md) · [Next.js](./docs/agents/nextjs.md) · [Auth](./docs/agents/better-auth.md) · [Dashboard](./docs/agents/dashboard.md) · [API](./docs/agents/api.md) · [Storage](./docs/agents/storage.md) · [i18n](./docs/agents/i18n.md) · [UI](./docs/agents/ui.md) · [SEO](./docs/agents/seo.md) · [Testing](./docs/agents/testing.md)

## Deploy

It runs wherever Next.js runs on Node.js: Vercel, a container or your own server. Run `pnpm --filter @repo/db db:migrate` against the production database before each release.

<details>
<summary>Checklist before you go live</summary>

- **URL:** set `BETTER_AUTH_URL` to your public origin. Sign-in, canonical URLs, the sitemap and share images use it.
- **Database:** on serverless, use a **pooled** `DATABASE_URL` (Neon, Supabase or PgBouncer). Direct connections run out under bursts of traffic.
- **Dependencies:** install on the platform you deploy to, as Vercel and Docker builds do. The share image renderer ships a native binary per OS, so `node_modules` copied from macOS or Windows won't work on Linux.
- **Email:** set `RESEND_API_KEY` and `EMAIL_FROM`.
- **Storage:** allow `GET`, `PUT` and `HEAD` from your origin in the bucket's CORS, serve files from `S3_PUBLIC_BASE_URL`, and run `pnpm storage:purge` hourly. [`storage-purge.yml`](./.github/workflows/storage-purge.yml) does it once you add its secrets ([details](./packages/storage/README.md#purging-stale-uploads)).
- **Proxies:** rate limits are kept in Postgres, so they hold across instances. Behind more than one proxy, set Better Auth's `advanced.ipAddress` so the client IP is right.
- **Sessions:** a session is cached in a cookie for up to 5 minutes, so a banned or demoted user can keep access until it expires.
- **Search:** set `GOOGLE_SITE_VERIFICATION`, then submit `/sitemap.xml` in Search Console ([seo.md](./docs/agents/seo.md)).
- **Never** set `EXPOSE_TESTING_API=1` in a deployment. It exists for the end-to-end build only.

Already in place: security headers (no framing, `nosniff`, `Referrer-Policy`, `Permissions-Policy`, HSTS in production) and a cross-site check plus 300 calls a minute per IP on `/api/rpc`.

</details>

## FAQ

**Can I use it commercially?** Yes. It's MIT licensed; keep the license notice in copies of the code.

**Why no client data library?** Server Components and Server Actions already cover reads and writes, and keep permissions on the server. Add one only for a live feature that needs it.

**Can I remove Persian or multi-tenancy?** Yes. Remove a locale with [these steps](./docs/agents/i18n.md#remove-a-locale); the language switcher hides itself when one is left. Remove a dashboard area by deleting its route folder, its `action/` folder and its messages.

**How do I get later updates?** Your copy is yours, not a dependency. To pull a change from this repository, add it as a remote and cherry-pick or merge.

**What's not included?** Billing, a CMS and analytics, so you can pick the provider that fits.

## Contributing

Issues and pull requests are welcome; read [CONTRIBUTING.md](./CONTRIBUTING.md) first. Report security issues privately, as [SECURITY.md](./SECURITY.md) describes. If the starter saves you time, a ⭐ helps others find it.

## License

[MIT](./LICENSE) © [dimah-kz](https://github.com/dimah-kz)
