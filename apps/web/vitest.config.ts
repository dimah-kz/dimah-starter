import { reactConfig } from "@repo/vitest-config"

export default reactConfig({
  name: "web",
  domSetupFiles: ["./vitest.setup.ts"],
})
