import { defineRelationsPart } from "drizzle-orm"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import {
  account,
  authRelations,
  relations as dimahS3Relations,
  invitation,
  member,
  organization,
  rateLimit,
  session,
  user,
  verification,
} from "./schema"

// `next dev` re-runs this module when the schema changes. Reuse the pool so
// each reload does not open another set of connections.
const globalForDb = globalThis as typeof globalThis & { pgPool?: Pool }
const pool =
  globalForDb.pgPool ?? new Pool({ connectionString: process.env.DATABASE_URL })
if (process.env.NODE_ENV !== "production") globalForDb.pgPool = pool

/**
 * The generated dimah-s3 relations register the storage tables under the
 * names its Drizzle adapter looks up. The empty part registers every auth
 * table on `db.query` (`verification` and `rateLimit` have no relations), and
 * the auth part replaces those entries with the real relation graph.
 */
export const db = drizzle({
  client: pool,
  relations: {
    ...dimahS3Relations,
    ...defineRelationsPart({
      user,
      session,
      account,
      verification,
      organization,
      member,
      invitation,
      rateLimit,
    }),
    ...authRelations,
  },
})
