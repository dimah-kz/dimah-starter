# Better Auth

Read when you change sign-in, sessions, users, organizations, roles, permissions, rate limits or auth mail.

Better Auth 1.7 runs on the server only. The web app has no auth client: pages read the session, and Server Actions call `auth.api.*`. A future mobile or extension app would configure its own client in that app.

| Concern                        | Where                                                            |
| ------------------------------ | ---------------------------------------------------------------- |
| Instance and plugins           | `packages/auth/src/auth.ts`                                      |
| Roles and permissions          | `packages/auth/src/organization-access.ts`, `admin-access.ts`    |
| Rate limits for Server Actions | `packages/auth/src/rate-limit.ts`                                |
| Error text for the UI          | `getAuthApiErrorMessage` (`packages/auth/src/auth-api-error.ts`) |
| Page gates                     | `apps/web/src/app/dashboard/lib/dashboard-session.ts`            |
| Redirect after sign-in         | `apps/web/src/app/(auth)/lib/auth-redirect.ts`                   |
| Auth tables (generated)        | `packages/db/src/schema/auth.schema.ts`                          |

## Configuration

Plugins: `admin`, `organization` (teams off), `lastLoginMethod`, `i18n` (error messages in the `NEXT_LOCALE` locale), `nextCookies`.

- **Email/password:** `requireEmailVerification` blocks sign-in until the link is opened. Password reset and password change both revoke the other sessions.
- **Google:** on when `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set. `googleSignInEnabled` hides the button otherwise. The callback is `/api/auth/callback/google`.
- **Sessions:** the cookie cache is 5 minutes, so a ban or role change can take that long to show for the affected user. `freshAge: 0` lets the account page list sessions.
- **Origins:** `BETTER_AUTH_URL` is the trusted origin; `http://localhost:3000` is trusted only outside production.
- **Mail:** verification, reset, duplicate sign-up and invitation mail go through `@repo/email`. Without `RESEND_API_KEY`, development prints them to the server log.

After changing the instance config (plugins, fields), regenerate the tables:

```bash
pnpm --filter @repo/db auth:generate && pnpm --filter @repo/db db:generate
```

Then commit the migration.

## Writes

One Server Action per file under `apps/web/src/app/action/…` — reference: `apps/web/src/app/action/dashboard/account/update-profile-action.ts`.

1. Read and validate the form input. Better Auth accepts any string for a name, so trim it and check its length.
2. Call `auth.api.<method>({ headers: await headers(), body })`. The headers carry the session and the locale. Better Auth checks the caller's permissions itself, so the action makes no check of its own.
3. Return `{ success: true }` or `{ success: false, error }`, where `error` is `getAuthApiErrorMessage(error)`: the translated Better Auth message, or `undefined` for anything else, which is logged and never shown. The UI falls back to its own copy from `@repo/i18n`.
4. Expire caches — [nextjs.md § After a write](./nextjs.md#after-a-write).

Auth form actions (`sign-in-with-email-action.ts` and its siblings) return `AuthFormState` for `useActionState` instead, and redirect on success.

Organization members, invitations and users change only through `auth.api` (`removeMember`, `cancelInvitation`, `banUser`, …), never by writing the auth tables directly: Better Auth runs its hooks, checks and cleanups there.

## Rate limits

Better Auth limits its own HTTP routes (`/api/auth`) with counters in `auth.rate_limit`. `auth.api` calls from Server Actions bypass that limiter, so the unauthenticated actions call `consumeRateLimit(rule, headers, email?)` first. Rules are in `rate-limit.ts`; each rule counts buckets keyed by client IP, email, or both:

- **Sign-in:** per account and per IP.
- **Reset:** per account and per inbox.
- **Sign-up and Google sign-in:** per IP.

A new unauthenticated flow that sends mail or checks a password gets a rule. Behind more than one proxy, set `advanced.ipAddress` so the IP is the client's.

## Permissions

Default roles: organization `owner` / `admin` / `member`, platform `admin` / `user`. `organization-access.test.ts` and `admin-access.test.ts` show what each may do.

- **Add a permission:** extend the statements and roles in `*-access.ts` (`createAccessControl`, `orgAc.newRole(…)`), then update the test tables.
- **Gate a page and its reads:** use `requirePlatformAdmin()` or `requireOrganizationManager()`. A new kind of access gets a `can*` helper beside them in `dashboard-session.ts`, built on `auth.api.hasPermission` or `auth.api.userHasPermission`.
- **Show or hide UI** with the same helpers, called on the server and passed down as props.

## Sessions

At render time, read the session with `auth.api.getSession({ headers: await dashboardAuthHeaders() })` — [nextjs.md § Session at render time](./nextjs.md#session-at-render-time). In a Server Action, use `auth.api.getSession({ headers: await headers() })`, or `createContext(headers).getSession()` when the action also calls the oRPC router, so the session is read once. `Session` is exported from `@repo/auth`.
