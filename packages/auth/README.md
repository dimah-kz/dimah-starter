# @repo/auth

[Better Auth](https://www.better-auth.com/) with email/password, Google (`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`), `admin`, `organization`, and `lastLoginMethod`. Apps mutate through `auth.api`.

Root exports: `auth`, `Session`, `getAuthApiErrorMessage`, `consumeRateLimit`, `googleSignInEnabled` (both Google env vars set — the login UI hides the button otherwise), and `lastLoginMethodCookieName`. Access control, origin, password limits, paths, and role parsing are subpath exports (`@repo/auth/admin-access`, …).

Rate-limit counters live in Postgres (`auth.rate_limit`) so they survive serverless. Better Auth's limiter only covers its HTTP routes (`/api/auth`), not `auth.api` calls, so Server Actions call `consumeRateLimit` (sign-in, sign-up, password reset) against the same table, keyed by client IP (Better Auth's `getIP`, so `advanced.ipAddress` applies) and email. Behind more than one proxy, set `advanced.ipAddress` or every client shares one bucket.

Session cookie cache is 5 minutes — ban/role changes can lag until it expires. `localhost` is not a trusted origin in production.

After config changes: `auth:generate` → `db:generate` → `db:migrate`.
