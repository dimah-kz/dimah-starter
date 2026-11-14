import { defineConfig, devices } from "@playwright/test"

const isCI = Boolean(process.env.CI)
const port = Number(process.env.E2E_PORT ?? 3100)
const baseURL = `http://localhost:${port}`

/**
 * End-to-end tests in `e2e/`, signed out, so they need no database rows.
 * Locally Playwright starts `next dev` on its own port (or reuses one already
 * there). CI serves the production build made with `EXPOSE_TESTING_API=1`,
 * which `instant()` from `@next/playwright` needs outside development.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // An installed browser (`chrome`, `msedge`) when Playwright's own
        // download is blocked or unwanted.
        channel: process.env.E2E_BROWSER_CHANNEL || undefined,
      },
    },
  ],
  webServer: {
    command: isCI ? `pnpm start --port ${port}` : `pnpm dev --port ${port}`,
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 180_000,
    env: { BETTER_AUTH_URL: baseURL },
  },
})
