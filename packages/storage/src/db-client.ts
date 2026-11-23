import { DimahS3Db } from "@dimah-s3/db"
import {
  drizzleAdapter,
  type DrizzleConfig,
} from "@dimah-s3/db/adapters/drizzle"

/**
 * The `@dimah-s3/db` client, with its tables in the `storage` PostgreSQL
 * schema. `s3.ts` passes the app's Drizzle instance. `scripts/dimah-s3.ts`
 * passes none: generating needs the dialect, not a connection.
 */
export function storageDbClient(db: DrizzleConfig["db"]) {
  return DimahS3Db.names
    .schema("storage")
    .client(drizzleAdapter({ db, provider: "postgresql" }))
}
