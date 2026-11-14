import { PASSKEY_ERROR_CODES } from "@better-auth/passkey"
import { haveIBeenPwned, TWO_FACTOR_ERROR_CODES } from "better-auth/plugins"
import { loadMessages, locales } from "@repo/i18n"
import { describe, expect, it } from "vitest"

// `auth.ts` merges `auth.errorCodes` into the i18n plugin's translations by
// Better Auth error code. A code renamed in an upgrade would silently fall back
// to English, so every key must still be a code a plugin throws.
const pluginCodes = new Set([
  ...Object.keys(TWO_FACTOR_ERROR_CODES),
  ...Object.keys(PASSKEY_ERROR_CODES),
  ...Object.keys(haveIBeenPwned().$ERROR_CODES),
])

describe.each(locales)("auth.errorCodes in %s", (locale) => {
  it("only names codes Better Auth plugins throw", () => {
    const keys = Object.keys(loadMessages(locale).auth.errorCodes)

    expect(keys.filter((key) => !pluginCodes.has(key))).toEqual([])
  })
})
