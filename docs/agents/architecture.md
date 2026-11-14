# Architecture

Read when you add a file, a package or a dependency, or move code between the app and packages.

## Workspace

pnpm workspaces `apps/*`, `packages/*` and `tooling/*`, run through Turborepo (`turbo.json`). `lint`, `typecheck` and `test` run per package in parallel. The `transit` task in `turbo.json` re-runs them when a dependency changes. `build` builds `apps/web`; packages ship TypeScript source and are compiled by the app (`transpilePackages` in `next.config.ts`), so they have no build step.

| Layer       | Owns                                                                 | Never holds                                     |
| ----------- | -------------------------------------------------------------------- | ----------------------------------------------- |
| `apps/web`  | Routes, layouts, Server Actions, feature UI, segment routes and tags | Auth config, schema, reusable primitives        |
| `packages/` | Auth, database, product API, storage, mail, i18n, UI primitives      | Routes, pages, Server Actions, dashboard chrome |
| `tooling/`  | ESLint, TypeScript and Vitest presets                                | Product code                                    |

Dependencies point one way: apps → packages, and packages → packages without cycles. A package never imports an app; an app never imports another app.

Each package's README says what it is for, and its `package.json` `exports` lists what it exposes. Import only those entry points.

## Placement

Search before you create: beside the caller, then the segment's `components/` or `lib/`, then `apps/web/src/components` or `src/lib`, then a package export.

- Code used by one caller stays in that file, even when it is a helper.
- A new file is for code a second caller needs, or for a segment's single source of truth (`*-routes.ts`, `cache-tags.ts`, `*-table-params.ts`).
- A segment's `lib/` (routes, tags, helpers such as `auth-redirect.ts`) is its public surface: other segments may import it. Its `components/` stay inside it. UI two segments need moves up to `apps/web/src/components`.
- Product procedures are the exception: one file per procedure in `packages/api/src/routers/<domain>/` — [api.md](./api.md).
- A new package is for core code (auth, data) or code another app will share. Two importers in `apps/web` are not a reason.

A feature is removable: its route folder, its folder under `app/action/`, and its keys in the routes, tags and message files.

## Naming

- **App reads:** `get-<thing>.ts`, exporting `get<Thing>`.
- **App writes:** `<verb>-<thing>-action.ts`, exporting `<verb><Thing>Action`.
- **Package functions:** `toX` / `fromX` / `parseX`, predicates `isX` / `xMatches`. Drop filler (`build`, `get`), don't repeat the package name, and don't shadow host APIs (`toPublicUrl`, not `publicUrl`).

## Versions

A dependency used by more than one workspace package, or released in lockstep with one (`@dimah-s3/*`, `@next/playwright` with `next`), lives in the `catalog` of `pnpm-workspace.yaml` and is referenced as `catalog:`. Bump it there. A single-package dependency or a `peerDependencies` range stays in that package's `package.json`.

## New package

`packages/<name>/` with `"name": "@repo/<name>"`, `"private": true`, `"type": "module"`, `exports` pointing at `src/*.ts`, a `tsconfig.json` extending `@repo/typescript-config`, an `eslint.config.js` from `@repo/eslint-config`, and a short `README.md`. Add it to `transpilePackages` in `apps/web/next.config.ts` if the app imports it. Tests: [testing.md](./testing.md).
