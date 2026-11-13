import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

// Unit tests sit beside their source as `*.test.ts`. Keep them to pure logic:
// anything that needs a request, a session or the database belongs in an
// end-to-end test against the running app.
export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./apps/web/src", import.meta.url)),
    },
  },
  test: {
    include: ["{apps,packages}/*/src/**/*.test.ts"],
  },
})
