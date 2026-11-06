# @repo/db

PostgreSQL via [Drizzle](https://orm.drizzle.team/) — schema, client, and migrations.

The shared database layer for auth, dimah-s3 storage metadata (schema 2.1.0 in the `storage` PostgreSQL schema), and product tables. Apps import the client and schema; they don’t own DB setup. Exports: `db` (`.`), the tables (`./schema`), and Drizzle operators (`./drizzle`). `@repo/storage` builds the dimah-s3 adapter over `db`; the storage tables are registered on it under the keys that adapter looks up (`dimahS3Tables`).

The client reads `DATABASE_URL` from the process environment and does not load `.env` itself: `next.config.ts` and `drizzle.config.ts` load the root `.env`.

`pg.Pool` is for a long-lived Node process. On Vercel (or similar), use a **pooled** `DATABASE_URL` (Neon pooler, PgBouncer, Supabase pooler). Direct connections will exhaust the pool under bursty functions.

```bash
pnpm --filter @repo/db db:migrate
pnpm --filter @repo/db db:studio
pnpm --filter @repo/db auth:generate   # after Better Auth config changes
```
