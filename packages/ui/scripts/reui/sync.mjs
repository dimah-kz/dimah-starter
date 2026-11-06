import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  blank,
  classifyOverrides,
  done,
  formatSyncSummary,
  formatUi,
  heading,
  ok,
  parseShadcnOutput,
  runPnpm,
  step,
} from "../lib/cli.mjs"
import { reuiComponents } from "./components.mjs"
import { applyReuiPatches, getOverrideFiles } from "./patches/index.mjs"

const uiRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../.."
)

/**
 * @param {{ skipFormat?: boolean }} [opts]
 */
export function syncReui(opts = {}) {
  step("reui", `updating ${reuiComponents.length} components…`)
  const { combined } = runPnpm(
    [
      "dlx",
      "shadcn@latest",
      "add",
      ...reuiComponents.map((name) => `@reui/${name}`),
      "--overwrite",
      "--yes",
    ],
    { cwd: uiRoot }
  )

  const raw = parseShadcnOutput(combined)
  const { updated, overridden } = classifyOverrides(
    raw.updated,
    getOverrideFiles()
  )
  ok(
    "reui",
    formatSyncSummary({
      updated,
      skipped: raw.skipped,
      overridden,
    })
  )

  step("patches", "applying…")
  const patchResults = applyReuiPatches(uiRoot)
  for (const result of patchResults) {
    const short = result.file.replace(/^src\/components\//, "")
    if (result.status === "applied") {
      ok("override", `${short} ← ${result.id}`)
    } else {
      ok("override", `${short} already present`)
    }
  }

  if (!opts.skipFormat) {
    blank()
    formatUi()
  }

  return { updated, skipped: raw.skipped, overridden, patches: patchResults }
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const started = Date.now()
  heading("ui:sync · reui")
  syncReui()
  done(Date.now() - started)
}
