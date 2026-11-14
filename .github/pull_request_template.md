## What and why

<!-- What this changes and the problem it solves. Link the issue: Fixes #… -->

## How I checked it

<!-- Tests added or run, and what you tried in the running app. -->

## Checklist

- [ ] `pnpm format:check`, `docs:check`, `lint`, `typecheck`, `test` and `build` pass
- [ ] Logic that would hurt if it broke silently has a test ([testing.md](../docs/agents/testing.md))
- [ ] UI copy is in `packages/i18n` for every locale
- [ ] A schema change comes with its migration (`pnpm --filter @repo/db db:generate`)
- [ ] The matching guide in `docs/agents/` or the package README is updated
