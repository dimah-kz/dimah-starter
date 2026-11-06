import { blank, done, formatUi, heading } from "./lib/cli.mjs"
import { syncReui } from "./reui/sync.mjs"
import { syncShadcn } from "./sync-shadcn.mjs"

const started = Date.now()
heading("ui:sync")

syncShadcn({ skipFormat: true })
blank()
syncReui({ skipFormat: true })
blank()
formatUi()

done(Date.now() - started)
