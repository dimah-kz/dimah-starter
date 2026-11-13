import { describe, expect, it } from "vitest"
import {
  DEFAULT_AUTH_REDIRECT,
  normalizeAuthRedirectTarget,
  withAuthRedirect,
} from "./auth-redirect"

describe("normalizeAuthRedirectTarget", () => {
  it("keeps a same-origin path with its query and hash", () => {
    expect(normalizeAuthRedirectTarget("/dashboard/account?tab=1#top")).toBe(
      "/dashboard/account?tab=1#top"
    )
  })

  it.each([
    "https://evil.com",
    "//evil.com",
    "/\\evil.com",
    "/\t/evil.com",
    "/\n/evil.com",
    "/.//evil.com",
    "/..//evil.com",
    "/a/..//evil.com",
    "/%2e//evil.com",
    "/%2e%2e//evil.com",
    "dashboard",
    "",
  ])("rejects %j", (value) => {
    expect(normalizeAuthRedirectTarget(value)).toBe(DEFAULT_AUTH_REDIRECT)
  })

  it("rejects anything that is not a string", () => {
    expect(normalizeAuthRedirectTarget(["/a", "/b"])).toBe(
      DEFAULT_AUTH_REDIRECT
    )
    expect(normalizeAuthRedirectTarget(undefined, "/login")).toBe("/login")
  })
})

describe("withAuthRedirect", () => {
  it("omits the default target", () => {
    expect(withAuthRedirect("/login", DEFAULT_AUTH_REDIRECT)).toBe("/login")
  })

  it("adds the target and extra params", () => {
    expect(
      withAuthRedirect("/login", "/dashboard/account", { email: "a@b.c" })
    ).toBe("/login?redirect=%2Fdashboard%2Faccount&email=a%40b.c")
  })
})
