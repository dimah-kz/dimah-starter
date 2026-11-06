import pluginNext from "@next/eslint-plugin-next"
import { defineConfig } from "eslint/config"

import { baseConfig, prettierConfig } from "./base.js"
import { reactConfig } from "./react.js"

// `core-web-vitals` includes every `recommended` rule.
export const nextJsConfig = defineConfig(
  baseConfig,
  reactConfig,
  pluginNext.configs["core-web-vitals"],
  prettierConfig
)
