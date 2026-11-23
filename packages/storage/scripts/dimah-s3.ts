/**
 * The FumaDB CLI for `@dimah-s3/db`, over the same `storage` schema as
 * `src/s3.ts`. `storage:generate` writes the Drizzle tables to `@repo/db`.
 */
import { runCli } from "@dimah-s3/db/cli"
import { storageDbClient } from "../src/db-client"

await runCli(storageDbClient(undefined))
