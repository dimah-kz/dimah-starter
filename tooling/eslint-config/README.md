# @repo/eslint-config

Shared ESLint flat configs, built with ESLint's `defineConfig`:

| Export                        | For                                     |
| ----------------------------- | --------------------------------------- |
| `@repo/eslint-config/base`    | TypeScript packages without React       |
| `@repo/eslint-config/react`   | React packages (`ui`, `storage`, email) |
| `@repo/eslint-config/next-js` | Next.js apps                            |

Each package has a one-line `eslint.config.js` that exports the matching `config` (`nextJsConfig` for apps). Add package-specific overrides there, after the shared config — see `packages/ui/eslint.config.js`.

Until typescript-eslint supports TypeScript >=7.1, this package depends on the TypeScript 6 compiler API (`catalog:ts-eslint` in `pnpm-workspace.yaml`). Workspace `typescript` stays on 7 for `tsc`.
