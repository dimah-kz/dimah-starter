import { describe, expect, it } from "vitest"
import { defaultLocale, localeCookieName, resolveLocaleFromHeaders } from "."

const withCookie = (cookie?: string) => ({
  get: (name: string) => (name === "cookie" ? (cookie ?? null) : null),
})

describe("resolveLocaleFromHeaders", () => {
  it("reads the locale cookie among others", () => {
    expect(
      resolveLocaleFromHeaders(withCookie(`a=1; ${localeCookieName}=fa; b=2`))
    ).toBe("fa")
  })

  it.each([
    ["no cookie header", withCookie()],
    ["an unknown locale", withCookie(`${localeCookieName}=xx`)],
    ["malformed encoding", withCookie(`${localeCookieName}=%E0%A4%A`)],
    ["a lookalike cookie name", withCookie(`x${localeCookieName}=fa`)],
  ])("falls back to the default for %s", (_, headers) => {
    expect(resolveLocaleFromHeaders(headers)).toBe(defaultLocale)
  })
})
