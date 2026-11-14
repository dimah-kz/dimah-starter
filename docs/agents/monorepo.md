# Monorepo

> Rule: `.cursor/rules/monorepo.mdc`

| Slot      | Path             | Role                                                    |
| --------- | ---------------- | ------------------------------------------------------- |
| Web       | `apps/web`       | Next.js product — [AGENTS.md](../../apps/web/AGENTS.md) |
| Mobile    | `apps/mobile`    | Future; share via `@repo/*`                             |
| Extension | `apps/extension` | Future; own UI shell, same core                         |

Do not import across apps. Workspaces: `apps/*`, `packages/*`, `tooling/*`. Turbo: `build` / `dev` / `lint` / `typecheck` (`lint` and `typecheck` run in parallel through the `transit` task, which still re-runs them when a dependency changes). `test` runs each package's Vitest suite the same way; the root `vitest.config.mts` serves `pnpm test:watch` and `pnpm test:coverage` across packages — [testing.md](./testing.md).

| Layer       | Owns                                       | Does not                                        |
| ----------- | ------------------------------------------ | ----------------------------------------------- |
| `packages/` | Auth, Drizzle, oRPC, storage, i18n, shadcn | Routes, pages, Server Actions, dashboard chrome |
| `tooling/`  | eslint / tsconfig / vitest presets         | Product code                                    |
| `apps/`     | Routes, layouts, actions, feature UI, SSOT | Auth/db logic that belongs in a package         |

`@repo/ui` = shadcn + ReUI + Dimah. App-composed UI (`list/`, dashboard chrome) stays in the app.

Server lists: [dashboard.md § Server lists](./dashboard.md#server-lists).

**Deps:** apps → packages OK. packages → packages OK if acyclic. packages → apps forbidden. app → app forbidden.

**Versions:** a dependency used by more than one workspace package (or released in lockstep with one, like `@dimah-s3/*`) lives in the `catalog` of `pnpm-workspace.yaml` and is referenced as `catalog:`. Bump it there only. Single-package dependencies and `peerDependencies` ranges stay in that package.json.

```bash
pnpm dev
pnpm build
pnpm lint
pnpm typecheck
pnpm test
pnpm --filter web dev
pnpm --filter @repo/db db:migrate
```

New package: `packages/<name>/` with `"name": "@repo/<name>"`, `"private": true`. Minimal public exports. One-paragraph `README.md` (not agent docs).
