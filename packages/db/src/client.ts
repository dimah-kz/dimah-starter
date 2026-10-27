import { config } from "dotenv"
import { defineRelationsPart } from "drizzle-orm"
import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import {
  account,
  authRelations,
  invitation,
  member,
  organization,
  private_dimah_s3_settings,
  rateLimit,
  session,
  storageObject,
  storageRelations,
  user,
  verification,
} from "./schema"

config({ path: "../../.env" })

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

/**
 * The empty part registers every table on `db.query` (`verification` and
 * `rateLimit` have no relations). Auth and storage parts replace those
 * entries with the real relation graph.
 */
export const db = drizzle({
  client: pool,
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
      storageObject,
      private_dimah_s3_settings,
    }),
    ...authRelations,
    ...storageRelations,
  },
})
export { pool }
