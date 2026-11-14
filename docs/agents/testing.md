# Testing

Read when you add or change tests, or logic that needs one.

Two layers. **Vitest** for logic you can call without a server: parsing, permissions, actions with their dependencies replaced, Client Components. **Playwright** for what only the running app shows: redirects, streaming, headers, instant navigations. Async Server Components and `'use cache'` reads are not unit-tested — Vitest cannot render them; cover them end to end.

Test what would hurt if it broke silently: security rules (redirects, scopes, permissions), parsing of user input, copy in every locale, the contract of a shared helper. Skip tests that restate the code or pin markup.

## Commands

| Command                             | Runs                                                                |
| ----------------------------------- | ------------------------------------------------------------------- |
| `pnpm test`                         | Every package's unit tests through Turborepo (cached, used by CI)   |
| `pnpm test:watch`                   | All projects in watch mode; `--project web` narrows it              |
| `pnpm test:coverage`                | All projects once, with a coverage report in `coverage/`            |
| `pnpm --filter @repo/auth test`     | One package                                                         |
| `pnpm test:e2e`                     | Playwright in `apps/web/e2e/` — starts `next dev` on port 3100      |
| `E2E_BROWSER_CHANNEL=msedge pnpm …` | Use an installed browser (`chrome`, `msedge`) instead of a download |

## Unit tests (Vitest)

A test is `*.test.ts` (Node) or `*.test.tsx` (jsdom) **beside** the file it tests, under `src/`. Import `describe` / `it` / `expect` / `vi` from `vitest` — there are no globals. Mocks, `vi.stubEnv` and `vi.stubGlobal` reset between tests (`@repo/vitest-config`).

A package gets tests with a `vitest.config.ts` (`nodeConfig()` or `reactConfig({ name })` from `@repo/vitest-config`), a `"test": "vitest run"` script, and `vitest` + `@repo/vitest-config` in `devDependencies`. The root `vitest.config.mts` picks the package up as a project. [tooling/vitest-config](../../tooling/vitest-config/README.md)

| What                | How                                                                                              | Copy                                                                      |
| ------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| Pure logic          | Call it; `it.each` for input tables                                                              | `apps/web/src/app/(auth)/lib/auth-redirect.test.ts`                       |
| Env-driven config   | `vi.stubEnv` — reset after each test                                                             | `packages/auth/src/app-origin.test.ts`                                    |
| Roles / permissions | A table of `resource:action` → role → allowed; update it on purpose when roles change            | `packages/auth/src/organization-access.test.ts`                           |
| oRPC procedure      | `call(procedure, input, { context })` or `createRouterClient`; mock `@repo/auth`                 | `packages/api/src/base.test.ts`                                           |
| Server Action       | `vi.mock` `next/headers`, `next/cache`, `next-intl/server`, `@repo/auth`; assert calls and tags  | `apps/web/src/app/action/dashboard/account/update-profile-action.test.ts` |
| Client Component    | `renderWithIntl` (`@/test/render`) + Testing Library + `user-event`; fake timers for debounce    | `apps/web/src/components/list/list-search.test.tsx`                       |
| Email               | Mock `./deliver`, render the captured React element                                              | `packages/email/src/messages.test.ts`                                     |
| Translations        | `packages/i18n/src/load-messages.test.ts` checks every locale has the same keys and placeholders | —                                                                         |

Mock a workspace package (`vi.mock("@repo/auth", …)`) whenever importing it would build a client: `@repo/auth` creates Better Auth and a database pool, `@repo/storage` an S3 client. Mock at the boundary the code under test calls, not deeper.

Query by role and accessible name (`getByRole("button", { name: "Clear search" })`), with the real `en` copy from `renderWithIntl`. A test that cannot find an element by its role usually found an accessibility bug.

No database in unit tests. A query that needs Postgres belongs in an end-to-end test, or in a Postgres-backed integration suite you add for it.

## End-to-end tests (Playwright)

`apps/web/e2e/*.spec.ts`, configured in `apps/web/playwright.config.ts`. They run signed out and need no database rows. Locally Playwright starts `next dev` on port 3100 (or reuses one already there); CI builds with `EXPOSE_TESTING_API=1` and runs `next start`.

- Prefer user-facing locators (`getByRole`, `getByLabel`) and web-first assertions (`await expect(locator).toBeVisible()`).
- `instant()` from `@next/playwright` asserts what a **client navigation** shows before dynamic content streams in — copy `e2e/auth.spec.ts`. Direct visits stream into the root layout's fallback, because the locale comes from a cookie; assert those without `instant()`.
- E2E files test the app from outside, through the browser and HTTP. Don't import `@repo/*` or `@/` into them: Playwright's loader cannot load the message catalogs' JSON imports, and a test that shares the app's code also shares its bugs.
- Signed-in flows need a user: create one in a Playwright `globalSetup` against a test database and save `storageState`. Not included yet.

## In CI

`.github/workflows/ci.yml`: the `check` job runs `pnpm test` with the other gates; the `e2e` job builds with the testing API and runs Playwright, uploading `playwright-report/` when it fails.
