import { db } from "@repo/db"
import { s3 } from "../src/s3"

// Soft-deleted rows are kept this long, then dropped.
const deletedRowRetentionMs = 30 * 24 * 60 * 60 * 1000

let purged = 0
let failed = 0
// One run handles up to 100 uploads. Stop once a run makes no progress:
// failed rows stay claimed and the next scheduled run retries them.
for (;;) {
  const run = await s3.db.purgeStale()
  purged += run.purged
  failed += run.failed
  if (!run.more || run.purged === 0) break
}
const { pruned } = await s3.db.pruneDeleted({
  olderThan: Date.now() - deletedRowRetentionMs,
})
await db.$client.end()

console.log(
  `[storage] purged ${purged} stale uploads (${failed} failed), pruned ${pruned} deleted rows`
)
if (failed > 0) process.exitCode = 1
