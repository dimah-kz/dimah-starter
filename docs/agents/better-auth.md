# Better Auth

> Rule: `.cursor/rules/better-auth.mdc`

Explore `@repo/auth` and sibling actions in `apps/web`.

| Concern                 | Location                                       |
| ----------------------- | ---------------------------------------------- |
| Auth instance + plugins | `packages/auth/src/auth.ts`                    |
| Org / admin permissions | `packages/auth/src/*-access.ts`                |
| Auth API errors         | `@better-auth/i18n` + `getAuthApiErrorMessage` |
| Role CSV parse          | `@repo/auth/role-string` (`parseRoleString`)   |
| Redirect helpers        | `apps/web/src/app/(auth)/lib/auth-redirect.ts` |
| Auth schema             | `packages/db` — generated from the CLI         |

## Config changes

1. Edit `auth.ts` and/or `*-access.ts`.
2. `pnpm --filter @repo/db auth:generate` → `db:generate` → `db:migrate`.
3. Do not hand-edit generated auth schema or add product tables there.

Teams stay off until you enable them in `organization()`.

`lastLoginMethod({ storeInDatabase: true })` — cookie for the login UI; `session.user.lastLoginMethod` from the DB. No auth client in core.

**Trusted origins** — `localhost` is not trusted in production. Set `BETTER_AUTH_URL`.

**Rate limit** — `storage: "database"` (`auth.rate_limit`). Applies to Better Auth **HTTP** routes, not `auth.api` Server Actions. Enable it so `/api/auth` (if you add it) works on serverless.

**Cookie cache** — 5 minutes. After a ban or role change, the actor may still look signed-in until that cache expires.

## Mutations (in an app)

1. One Server Action under `app/action/…` mirroring the route.
2. `auth.api.<method>` with `headers: await headers()` (session + locale cookie). Sign-in/up still pass `body`; `nextCookies()` sets cookies.
3. Surface Better Auth errors with `getAuthApiErrorMessage`. Other copy from `@repo/i18n` via `getTranslations`.
4. `updateTag` after success when the actor’s UI must refresh — [caching.md](./caching.md).

Never: direct deletes on auth member/invite tables, `dashboard-access.ts`, duplicate permission matrices, write Route Handlers.

## Permissions

1. Extend statements + roles in `organization-access.ts` or `admin-access.ts`.
2. UI/route gate (optional): `hasPermission` (org) or `userHasPermission` (platform) — copy a sibling.
3. Mutations: no extra pre-check — `auth.api` enforces.

## Session

`auth.api.getSession({ headers: await headers() })` for reads and layout gates. Never `'use cache'` on session. Client components must not import `@repo/auth`.

Auth client config for a future mobile/extension app lives in that app — not in core packages.
