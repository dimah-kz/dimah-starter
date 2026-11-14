#!/usr/bin/env node
/**
 * Fails when the docs point at something that is not in the repository:
 * a relative Markdown link, or a backticked path that starts at a top-level
 * folder (`apps/…`, `packages/…`) from the repository root or the doc's own
 * folder. Stale paths send people and coding agents after files that no
 * longer exist.
 *
 * Checks tracked and new `*.md` / `*.mdc` files. Paths with placeholders
 * (`<name>`, `*`, `…`, `{a,b}`) are skipped. Links in `.cursor/rules/*.mdc`
 * resolve from the repository root, as Cursor reads them.
 */
import { execFileSync } from "node:child_process"
import { existsSync } from "node:fs"
import { readFile } from "node:fs/promises"
import path from "node:path"

const roots = [
  "apps/",
  "packages/",
  "tooling/",
  "docs/",
  "scripts/",
  ".github/",
  ".cursor/",
]

const files = execFileSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "*.md", "*.mdc"],
  { encoding: "utf8" }
)
  .split("\n")
  .filter((file) => file && existsSync(file))

const isPlaceholder = (value) => /[<>*…{}]/.test(value)
const problems = []

for (const file of files) {
  const text = (await readFile(file, "utf8")).replace(/```[\s\S]*?```/g, "")
  const base = file.endsWith(".mdc") ? "." : path.dirname(file)

  for (const [, bracketed, plain] of text.matchAll(
    /\]\((?:<([^>]+)>|([^)\s]+))\)/g
  )) {
    const target = bracketed ?? plain
    if (/^(https?:|mailto:|#)/.test(target)) continue
    const resolved = path.join(base, decodeURI(target.split("#")[0]))
    if (!existsSync(resolved)) problems.push(`${file}: link ${target}`)
  }

  for (const [, code] of text.matchAll(/`([^`\n]+)`/g)) {
    const candidate = code
      .trim()
      .split(/[\s:]/)[0]
      .replace(/[),.]+$/, "")
    if (!roots.some((root) => candidate.startsWith(root))) continue
    if (isPlaceholder(candidate)) continue
    // From the repository root, or from the doc's own folder (package READMEs).
    if (existsSync(candidate) || existsSync(path.join(base, candidate)))
      continue
    problems.push(`${file}: path ${candidate}`)
  }
}

if (problems.length > 0) {
  console.error(`Docs point at ${problems.length} missing target(s):\n`)
  for (const problem of problems) console.error(`  ${problem}`)
  process.exit(1)
}

console.log(`Docs links and paths resolve (${files.length} files).`)
