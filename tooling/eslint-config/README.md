# @repo/eslint-config

Shared ESLint presets: `base`, `react`, `next-js`, and `design-system` (plus shared `ignores`).

`design-system` is `@shadcn/lint`. `next-js` includes it. `@repo/ui` includes it and turns appearance rules off under `src/components`, where primitives own their styles.

Apps and packages extend the matching export instead of defining their own lint rules from scratch.

Until typescript-eslint supports TypeScript >=7.1, this package depends on the TypeScript 6 compiler API (`catalog:ts-eslint` in `pnpm-workspace.yaml`). Workspace `typescript` stays on 7 for `tsc`.
