/**
 * The FumaDB CLI for `@dimah-s3/db`, with the tables in the `storage`
 * PostgreSQL schema as in `src/s3.ts`. `storage:generate` writes the Drizzle
 * tables to `@repo/db`; generating needs the dialect, not a connection.
 */
import { DimahS3DB } from "@dimah-s3/db"
import { drizzleAdapter } from "@dimah-s3/db/adapters/drizzle"
import { runCli } from "@dimah-s3/db/cli"

await runCli(
  DimahS3DB.names
    .schema("storage")
    .client(drizzleAdapter({ db: undefined, provider: "postgresql" }))
)
