import { resolve } from "node:path"
import { defineConfig, type ViteUserConfig } from "vitest/config"

/**
 * Shared by every package: a test is a `*.test.ts` or `*.test.tsx` file beside
 * the code it tests under `src/`, and imports `describe` / `it` / `expect` from
 * `vitest` (no globals). Mocks, stubbed env vars and stubbed globals reset
 * between tests, so no test leaks state into the next one.
 */
const shared = {
  clearMocks: true,
  restoreMocks: true,
  unstubEnvs: true,
  unstubGlobals: true,
  // Vitest keeps transformed modules in the workspace root by default and
  // clears that folder when it starts, so packages tested in parallel by
  // Turborepo would race on it. Each run gets the folder of the package it
  // runs in.
  fsModuleCachePath: resolve("node_modules/.vitest-cache"),
} satisfies NonNullable<ViteUserConfig["test"]>

/** Server-only packages: every test runs on Node. */
export function nodeConfig(): ViteUserConfig {
  return defineConfig({
    test: {
      ...shared,
      include: ["src/**/*.test.ts"],
      environment: "node",
    },
  })
}

/**
 * Packages with React. `*.test.ts` runs on Node like any server code;
 * `*.test.tsx` renders components in jsdom. `name` labels both projects in
 * the output (`web`, `web:dom`) and must be unique in the workspace.
 */
export function reactConfig(options: {
  name: string
  /** Runs before each `.tsx` test file, e.g. Testing Library cleanup. */
  domSetupFiles?: string[]
}): ViteUserConfig {
  return defineConfig({
    // TypeScript keeps JSX for the app's bundler (`"jsx": "preserve"`);
    // tests compile it themselves.
    oxc: { jsx: { runtime: "automatic" } },
    resolve: { tsconfigPaths: true },
    test: {
      ...shared,
      projects: [
        {
          extends: true,
          test: {
            name: options.name,
            include: ["src/**/*.test.ts"],
            environment: "node",
          },
        },
        {
          extends: true,
          test: {
            name: `${options.name}:dom`,
            include: ["src/**/*.test.tsx"],
            environment: "jsdom",
            setupFiles: options.domSetupFiles,
          },
        },
      ],
    },
  })
}
