import { describe, expect, it, vi } from "vitest"
import { appOrigin, DEV_ORIGIN, toAbsoluteAppUrl } from "./app-origin"

describe("appOrigin", () => {
  it("uses BETTER_AUTH_URL without trailing slashes", () => {
    vi.stubEnv("BETTER_AUTH_URL", " https://app.example.com// ")

    expect(appOrigin()).toBe("https://app.example.com")
    expect(toAbsoluteAppUrl("/login?x=1")).toBe(
      "https://app.example.com/login?x=1"
    )
  })

  it("falls back to localhost outside production", () => {
    vi.stubEnv("BETTER_AUTH_URL", "")
    vi.stubEnv("NODE_ENV", "development")

    expect(appOrigin()).toBe(DEV_ORIGIN)
  })

  it("refuses to guess the origin in production", () => {
    vi.stubEnv("BETTER_AUTH_URL", "")
    vi.stubEnv("NODE_ENV", "production")

    expect(() => appOrigin()).toThrow("BETTER_AUTH_URL is not set")
  })
})
