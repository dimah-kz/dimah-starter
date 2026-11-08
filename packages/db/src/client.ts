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

/**
 * The generated dimah-s3 relations register the storage tables under the
 * names its Drizzle adapter looks up. The empty part registers every auth
 * table on `db.query` (`verification` and `rateLimit` have no relations), and
 * the auth part replaces those entries with the real relation graph.
 */
export const db = drizzle({
  client: new Pool({ connectionString: process.env.DATABASE_URL }),
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
