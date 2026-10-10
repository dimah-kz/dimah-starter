# Architecture

> Rule: `.cursor/rules/architecture.mdc`

Core lives in `packages/` (auth, db, product oRPC). Feature UI is a **removable subtree** in an app: `route` + matching `action/` + SSOT keys. Product procedures live in [`@repo/api`](../../packages/api) — [api.md](./api.md).

## Placement {#placement}

Inline in the file you are editing.

A **new file** only when something is reused in 2+ places, or it is segment SSOT (`*-routes.ts`, `cache-tags.ts`).

~10–20 lines at one call site → do not extract.

**Search up before creating a file**

- App: beside `page.tsx` → parent `components/` → segment `lib/` or `components/` → `src/components/` → `@repo/ui/components/*`
- Package: beside the caller → package `src/` → an export already on `index.ts`
- Product procedures: `packages/api/src/routers/<domain>/<procedure>.ts` — one file per procedure, even when short. [api.md](./api.md)

**Deps:** sub-feature → segment `lib/` → `src/lib` / `src/components`. No cross-sibling feature imports. Apps import `@repo/*`. Packages never import apps.

## App segment SSOT

| Concern        | Pattern                                                                              |
| -------------- | ------------------------------------------------------------------------------------ |
| URLs           | `*-routes.ts`                                                                        |
| Cache tags     | `cache-tags.ts`                                                                      |
| Dashboard copy | `@repo/i18n` `dashboard.json`                                                        |
| Writes         | `app/action/<segment>/` — one mutation per file → `auth.api` or `createRouterClient` |
| Reads          | `get-*.ts` + `'use cache'`                                                           |

Forbidden: `dashboard-access.ts`, custom RBAC modules, mutation Route Handlers except `/api/rpc`.

## Naming {#naming}

Package APIs (not app `get-*.ts`): `toX` / `fromX` / `parseX`; predicates `xMatches` / `isX`. Drop filler (`build`, `get`). Don’t repeat the package name. Don’t collide with host APIs (`toPublicUrl`, not `publicUrl`).

Auth tables stay generated in `@repo/db`. Product tables = `@repo/db`. Product procedures = `@repo/api`.

## Do not over-extract {#do-not-over-extract}

One importer is not reuse. No thin wrappers. A new package only if it is core (auth, db) or will be shared with `mobile` / `extension`.
