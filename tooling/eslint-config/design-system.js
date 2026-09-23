import { plugin as shadcn } from "@shadcn/lint"

/** @type {import("eslint").Linter.Config[]} */
export const designSystemConfig = [
  {
    name: "repo/design-system",
    files: ["src/**/*.{js,jsx,ts,tsx}"],
    plugins: { shadcn },
    rules: {
      "shadcn/no-restyle": ["error", { allow: ["layout"] }],
      "shadcn/no-raw-colors": "error",
      "shadcn/no-arbitrary-values": ["error", { allow: ["layout"] }],
      "shadcn/no-inline-styles": "error",
      "shadcn/no-unknown-classes": "error",
      "shadcn/require-static-classes": "error",
    },
  },
]

/**
 * Upstream shadcn/Base UI class strings this theme's Tailwind does not emit.
 * They ship inside generated primitives (`pnpm ui:sync`); product code in
 * `apps/web` does not get this allow list.
 */
const generatedClassExceptions = [
  "cn-input-otp",
  "data-[swipe-direction=left]:origin-start",
  "data-[swipe-direction=right]:origin-end",
  "data-[ending-style]:easing-[ease]",
  "xs:w-(--popup-width)",
  "*data-activation-direction=*:*",
]

/**
 * Component sources own appearance, including structural arbitrary values.
 * Token and class-existence rules stay on. Apply from the UI package only —
 * `src/components` in an app is product UI and must keep the full policy.
 *
 * @type {import("eslint").Linter.Config}
 */
export const designSystemComponentOverride = {
  name: "repo/design-system-components",
  files: ["src/components/**/*.{js,jsx,ts,tsx}"],
  rules: {
    "shadcn/no-restyle": "off",
    "shadcn/no-arbitrary-values": "off",
    "shadcn/require-static-classes": "off",
    "shadcn/no-unknown-classes": ["error", { allow: generatedClassExceptions }],
  },
}
