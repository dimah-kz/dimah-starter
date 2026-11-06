import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier/flat"
import { defineConfig, globalIgnores } from "eslint/config"
import turboPlugin from "eslint-plugin-turbo"
import tseslint from "typescript-eslint"

export const baseConfig = defineConfig(
  globalIgnores(
    [
      "**/dist/**",
      "**/.next/**",
      "**/out/**",
      "**/build/**",
      "**/.turbo/**",
      "**/coverage/**",
      "**/next-env.d.ts",
    ],
    "repo/ignores"
  ),
  js.configs.recommended,
  tseslint.configs.recommended,
  turboPlugin.configs["flat/recommended"],
  {
    name: "repo/overrides",
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "turbo/no-undeclared-env-vars": "warn",
    },
  }
)

/** Turns off rules that Prettier owns — always last. */
export const prettierConfig = eslintConfigPrettier

export const config = defineConfig(baseConfig, prettierConfig)
