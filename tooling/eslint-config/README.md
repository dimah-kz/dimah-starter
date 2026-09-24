# @repo/eslint-config

Shared ESLint presets: `base`, `react`, and `next-js` (plus shared `ignores`).

Apps and packages extend the matching export instead of defining their own lint rules from scratch.

Until typescript-eslint supports TypeScript >=7.1, this package depends on the TypeScript 6 compiler API (`catalog:ts-eslint` in `pnpm-workspace.yaml`). Workspace `typescript` stays on 7 for `tsc`.
