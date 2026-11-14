# Contributing

Thanks for helping improve Dimah Starter. Bug reports, fixes and documentation improvements are all welcome.

## Before you start

- **Bug or idea?** Open an issue first for anything larger than a small fix, so we can agree on the approach before you write code.
- **Security issue?** Do not open a public issue — follow [SECURITY.md](./SECURITY.md).

## Setup

Follow [Quick start](./README.md#quick-start). `docker compose up -d --wait` gives you a local PostgreSQL that matches `.env.example`.

## How the code is organized

Read [`AGENTS.md`](./AGENTS.md) first: the commands, the rules every change follows, and which guide in [`docs/agents/`](./docs/agents/README.md) covers the area you are changing. The guides are written for people and AI agents alike. In short:

- Core logic goes in `packages/`; routes, Server Actions and feature UI go in `apps/web`.
- Writes are Server Actions that call `auth.api` or the oRPC router. Reads of private data are gated, then go through tagged `'use cache'` functions.
- UI copy goes in `packages/i18n/src/messages/` in every locale (`en` and `fa`).
- Next.js is 16.4 with Cache Components. Its docs for this exact version are in `apps/web/node_modules/next/dist/docs/`.

## Pull requests

1. Keep each pull request to one change, and describe what it fixes and how you checked it.
2. Run the same checks as CI:

   ```bash
   pnpm format:check
   pnpm docs:check
   pnpm lint
   pnpm typecheck
   pnpm test
   pnpm build
   pnpm test:e2e   # optional locally; CI runs it
   ```

3. Add a test for logic that would hurt if it broke silently — [testing.md](./docs/agents/testing.md).
4. Update the matching guide in `docs/agents/` or the package README when you change how something works.

By contributing, you agree that your contributions are licensed under the [MIT License](./LICENSE).
