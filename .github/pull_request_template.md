## What and why

<!-- What this changes and the problem it solves. Link the issue: Fixes #… -->

## How I checked it

<!-- Tests added or run, and what you tried by hand. -->

## Checklist

- [ ] `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, `pnpm test` and `pnpm build` pass
- [ ] Logic that would hurt if it broke silently has a test ([testing.md](../docs/agents/testing.md))
- [ ] UI copy is in `packages/i18n` for **both** `en` and `fa`
- [ ] A schema change comes with its migration (`pnpm --filter @repo/db db:generate`)
- [ ] The matching guide in `docs/agents/` or package README is updated
