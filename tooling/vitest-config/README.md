# @repo/vitest-config

Shared [Vitest](https://vitest.dev) presets. Each package with tests has a short `vitest.config.ts` that returns one of them:

| Export                  | For                                                                                  |
| ----------------------- | ------------------------------------------------------------------------------------ |
| `nodeConfig()`          | Server-only packages: every `src/**/*.test.ts` on Node                               |
| `reactConfig({ name })` | Packages with React: `*.test.ts` on Node, `*.test.tsx` in jsdom (`name`, `name:dom`) |

Both clear mocks and restore stubbed env vars and globals between tests, and expect `describe` / `it` / `expect` imported from `vitest`.

To add tests to a package:

1. `vitest.config.ts` — `export default nodeConfig()`, or `reactConfig({ name: "…" })` with a unique name.
2. `"test": "vitest run"` in its `package.json`, and `vitest` (`catalog:`) plus `@repo/vitest-config` (`workspace:*`) in `devDependencies`. A `.tsx` test also needs `jsdom` and Testing Library — see `apps/web`.
3. Add `vitest.config.ts` to the package's `tsconfig.json` `include`.

`pnpm test` runs it through Turborepo; the root `vitest.config.mts` picks it up for `pnpm test:watch` and `pnpm test:coverage`. Package-specific options go after the preset with `mergeConfig`. How to write the tests: [docs/agents/testing.md](../../docs/agents/testing.md).
