import pluginReact from "eslint-plugin-react"
import pluginReactHooks from "eslint-plugin-react-hooks"
import { defineConfig } from "eslint/config"
import globals from "globals"

import { baseConfig, prettierConfig } from "./base.js"

export const reactConfig = defineConfig(
  pluginReact.configs.flat.recommended,
  pluginReact.configs.flat["jsx-runtime"],
  {
    name: "repo/react-overrides",
    languageOptions: { globals: globals.browser },
    // Pin version — `detect` still uses ESLint APIs removed in v10.
    settings: { react: { version: "19" } },
    rules: {
      "react/prop-types": "off",
    },
  },
  pluginReactHooks.configs.flat.recommended,
  {
    name: "repo/node-scripts",
    files: ["scripts/**/*.{js,mjs,cjs}"],
    languageOptions: { globals: globals.node },
  }
)

export const config = defineConfig(baseConfig, reactConfig, prettierConfig)
