# Contributing

Thanks for helping improve Dimah Starter. Bug reports, fixes and documentation improvements are all welcome.

## Before you start

- **Bug or idea?** Open an issue first for anything larger than a small fix, so we can agree on the approach before you write code.
- **Security issue?** Do not open a public issue — follow [SECURITY.md](./SECURITY.md).

## Setup

Follow [Quick start](./README.md#quick-start) to run the app locally with your own PostgreSQL database.

## How the code is organized

Read [`AGENTS.md`](./AGENTS.md) first. It is short, and it links to the guide for each area in [`docs/agents/`](./docs/agents). Those guides apply to people and AI agents alike:

- Core logic goes in `packages/`; routes, actions and feature UI go in `apps/web`.
- Inline by default — add a file only when code is reused or is a segment's single source of truth.
- Writes are Server Actions that call `auth.api` or the oRPC router; reads are `'use cache'` functions with tags.
- UI copy goes in `packages/i18n/src/messages/` in **both** `en` and `fa`.
- Next.js APIs: read the docs bundled in `apps/web/node_modules/next/dist/docs/` — this version is newer than most references online.

## Pull requests

1. Keep each pull request to one change, and describe what it fixes and how you checked it.
2. Run the same checks as CI:

   ```bash
   pnpm format:check
   pnpm lint
   pnpm typecheck
   pnpm build
   ```

3. Update the matching guide in `docs/agents/` or a package README when you change how something works.

By contributing, you agree that your contributions are licensed under the [MIT License](./LICENSE).
