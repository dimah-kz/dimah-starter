# @repo/typescript-config

Shared `tsconfig` bases. Packages are internal: their TypeScript source is compiled by the app's bundler, so `tsc` only typechecks (`noEmit`, `Bundler` resolution).

| Base                 | For                                                                 |
| -------------------- | ------------------------------------------------------------------- |
| `base.json`          | Server-only packages (`api`, `auth`, `db`, `i18n`, `vitest-config`) |
| `react-library.json` | Packages with React or DOM code                                     |
| `nextjs.json`        | Next.js apps                                                        |

A package `tsconfig.json` extends one of them and adds only what is specific to it, usually just `include`.
