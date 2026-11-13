import { afterEach, describe, expect, it, vi } from "vitest"
import { fromPublicUrl, toPublicUrl } from "./public-url"

describe("public URLs", () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it("round-trips a key with characters that need encoding", () => {
    vi.stubEnv("S3_PUBLIC_BASE_URL", "https://cdn.example.com/")
    const key = "logo/org-1/0b6c/logo #1 (final).png"
    const url = toPublicUrl(key)

    expect(url).toMatch(/^https:\/\/cdn\.example\.com\/logo\/org-1\/0b6c\//)
    expect(url).not.toContain(" ")
    expect(fromPublicUrl(url!)).toBe(key)
  })

  it("rejects URLs outside the public base", () => {
    vi.stubEnv("S3_PUBLIC_BASE_URL", "https://cdn.example.com")

    expect(fromPublicUrl("https://cdn.example.com.evil.com/a.png")).toBeNull()
    expect(fromPublicUrl("https://cdn.example.com/")).toBeNull()
    expect(fromPublicUrl("https://cdn.example.com/%E0%A4%A")).toBeNull()
  })

  it("is null when no public base is configured", () => {
    vi.stubEnv("S3_PUBLIC_BASE_URL", "")

    expect(toPublicUrl("avatar/u/1/a.png")).toBeNull()
    expect(fromPublicUrl("https://cdn.example.com/avatar/u/1/a.png")).toBeNull()
  })
})
