# apps/web

The Next.js app. The root [AGENTS.md](../../AGENTS.md) applies here too.

- **Imports:** `@/` is `src/`.
- **Segment layout:**
  - `page.tsx` and `layout.tsx`
  - `components/` for UI only that segment uses
  - `lib/` for `get-*.ts` reads, `*-routes.ts`, `cache-tags.ts` and `*-table-params.ts`
  - each write in the matching folder under `src/app/action/`
- **Rendering, Suspense and the session at render time:** [nextjs.md](../../docs/agents/nextjs.md).
- **Tests:**
  - `*.test.ts` runs on Node and `*.test.tsx` in jsdom.
  - `renderWithIntl` in `src/test/render.tsx` renders with the real messages.
  - End-to-end specs live in `e2e/`.

  See [testing.md](../../docs/agents/testing.md).

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
