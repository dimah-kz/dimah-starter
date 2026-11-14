// Next.js runs the app from `apps/web`, and server code reads files relative to
// it through `process.cwd()`, such as the share-image font. Turborepo runs the
// tests there too, but root runs (`pnpm test:watch`, `pnpm test:coverage`)
// start at the repository root, so every test moves to the app first.
process.chdir(import.meta.dirname)
