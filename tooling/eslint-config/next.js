import pluginNext from "@next/eslint-plugin-next"

import { baseConfig, prettierConfig } from "./base.js"
import { reactConfig } from "./react.js"

/** @type {import("eslint").Linter.Config[]} */
export const nextJsConfig = [
  ...baseConfig,
  ...reactConfig,
  pluginNext.configs.recommended,
  pluginNext.configs["core-web-vitals"],
  prettierConfig,
]
