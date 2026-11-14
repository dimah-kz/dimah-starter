import { reactConfig } from "@repo/vitest-config"
import { mergeConfig } from "vitest/config"

export default mergeConfig(
  reactConfig({
    name: "web",
    domSetupFiles: ["./vitest.setup.ts"],
  }),
  { test: { setupFiles: ["./vitest.cwd.ts"] } }
)
