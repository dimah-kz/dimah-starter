import { defineConfig } from "vitest/config"

/**
 * Every package with a `vitest.config.ts` is one project here. `pnpm test`
 * runs each package through Turborepo, which caches results; this file serves
 * `pnpm test:watch` and `pnpm test:coverage` across the whole repo.
 */
export default defineConfig({
  test: {
    projects: ["{apps,packages}/*/vitest.config.ts"],
    coverage: {
      provider: "v8",
      include: ["{apps,packages}/*/src/**/*.{ts,tsx}"],
      exclude: [
        "**/*.test.{ts,tsx}",
        "**/*.d.ts",
        // Generated: `pnpm ui:sync`, `auth:generate`, `storage:generate`.
        "packages/ui/src/components/**",
        "packages/db/src/schema/**",
      ],
      reporter: ["text-summary", "html", "lcov"],
    },
  },
})
