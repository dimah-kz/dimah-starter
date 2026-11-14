import { nextJsConfig } from "@repo/eslint-config/next-js"
import { defineConfig } from "eslint/config"

const ogImageEngine = "Use renderImage from @/components/og/render-image."

export default defineConfig(
  nextJsConfig,
  {
    // `next/og` reverses Persian word order. Every generated image goes
    // through the one Takumi helper, so the engine changes in one file.
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [{ name: "next/og", message: ogImageEngine }],
          patterns: [
            { group: ["takumi-js", "takumi-js/*"], message: ogImageEngine },
          ],
        },
      ],
    },
  },
  {
    files: ["src/components/og/render-image.ts"],
    rules: { "no-restricted-imports": "off" },
  }
)
