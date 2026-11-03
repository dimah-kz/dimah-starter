# @repo/db

PostgreSQL via [Drizzle](https://orm.drizzle.team/) — schema, client, and migrations.

The shared database layer for auth, dimah-s3 storage metadata (schema 2.1.0 in the `storage` PostgreSQL schema), and product tables. Apps import the client and schema; they don’t own DB setup.

`pg.Pool` is for a long-lived Node process. On Vercel (or similar), use a **pooled** `DATABASE_URL` (Neon pooler, PgBouncer, Supabase pooler). Direct connections will exhaust the pool under bursty functions.

```bash
pnpm --filter @repo/db db:migrate
pnpm --filter @repo/db db:studio
pnpm --filter @repo/db auth:generate   # after Better Auth config changes
```
