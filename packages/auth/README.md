# @repo/auth

[Better Auth](https://www.better-auth.com/) with email/password, Google (`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`), `admin`, `organization`, and `lastLoginMethod`. Apps mutate through `auth.api`.

Rate-limit counters live in Postgres (`auth.rate_limit`) so they survive serverless. That limiter applies to Better Auth HTTP routes, not `auth.api` Server Actions. Session cookie cache is 5 minutes — ban/role changes can lag until it expires. `localhost` is not a trusted origin in production.

After config changes: `auth:generate` → `db:generate` → `db:migrate`.
