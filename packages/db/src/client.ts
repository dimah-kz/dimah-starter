import { defineRelationsPart } from "drizzle-orm"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import {
  account,
  authRelations,
  dimahS3Tables,
  invitation,
  member,
  organization,
  rateLimit,
  session,
  user,
  verification,
} from "./schema"

/**
 * The empty part registers every table on `db.query` (`verification`,
 * `rateLimit`, and the storage tables have no relations). The auth part
 * replaces those entries with the real relation graph. The storage keys are
 * the ones the dimah-s3 Drizzle adapter looks up.
 */
export const db = drizzle({
  client: new Pool({ connectionString: process.env.DATABASE_URL }),
  relations: {
    ...defineRelationsPart({
      user,
      session,
      account,
      verification,
      organization,
      member,
      invitation,
      rateLimit,
      ...dimahS3Tables,
    }),
    ...authRelations,
  },
})
