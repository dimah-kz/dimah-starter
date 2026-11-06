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

**Google** — `socialProviders.google` when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set. The auth action calls `auth.api.signInSocial` (`disableRedirect`) and redirects to the returned URL. Callback: `/api/auth/callback/google`. A verified Google email links to an existing user (Better Auth default). The button renders only when both env vars are set (`googleSignInEnabled` from `@repo/auth`).

**Trusted origins** — `localhost` is not trusted in production. Set `BETTER_AUTH_URL`.

**Rate limit** — `storage: "database"` (`auth.rate_limit`), so counters survive serverless. Better Auth applies it to its HTTP routes (`/api/auth`) only. Server Actions that call `auth.api` for sign-in, sign-up and password reset call `consumeRateLimit(rule, headers, email)` from `@repo/auth` first — same table, keyed by client IP (`advanced.ipAddress`) and email. Add a rule there for any new unauthenticated flow that sends mail or checks a password.

**Cookie cache** — 5 minutes. After a ban or role change, the actor may still look signed-in until that cache expires.

**Email** — `@repo/email` (Resend). `auth.ts` sends verification, password reset, duplicate sign-up notice, and organization invitation mail. `requireEmailVerification` blocks email/password sign-in until the link is opened. Password reset revokes other sessions. Invitation links go to `/accept-invitation/[id]`; accepting requires a verified session (`requireEmailVerificationOnInvitation`). Mounted handler: `app/api/auth/[...all]` — that is the Better Auth HTTP surface for those links, not a product write route. In development, missing `RESEND_API_KEY` logs the message instead of sending.

## Mutations (in an app)

1. One Server Action under `app/action/…` mirroring the route.
2. `auth.api.<method>` with `headers: await headers()` (session + locale cookie). Sign-in/up still pass `body`; `nextCookies()` sets cookies.
3. Return `{ success, error? }`. `error` is `getAuthApiErrorMessage(error)` — the translated Better Auth message, or `undefined` for anything else (logged, never shown); the caller falls back to its own copy from `@repo/i18n`.
4. `updateTag` after success when the actor’s UI must refresh — [caching.md](./caching.md).

Never: direct deletes on auth member/invite tables, `dashboard-access.ts`, duplicate permission matrices, write Route Handlers.

## Permissions

1. Extend statements + roles in `organization-access.ts` or `admin-access.ts`.
2. Page and data gate: `requirePlatformAdmin()` / `requireOrganizationManager()` in `apps/web/src/app/dashboard/lib/dashboard-session.ts`, called by the page **and** its `get-*.ts` (a layout check alone still lets the page render). New permission → a `can*` helper beside them.
3. Mutations: no extra pre-check — `auth.api` enforces.

## Session

`auth.api.getSession({ headers: await dashboardAuthHeaders() })` for reads and gates. `dashboardAuthHeaders()` waits on `io()` first so Better Auth's expiry `Date.now()` runs in the Dynamic stage. Server Actions keep `headers: await headers()`. Never `'use cache'` on session. Client components must not import `@repo/auth`.

Auth client config for a future mobile/extension app lives in that app — not in core packages.
