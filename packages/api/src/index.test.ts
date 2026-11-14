import { consumeRateLimit } from "@repo/auth"
import { describe, expect, it, vi } from "vitest"
import { handleRequest } from "./index"

vi.mock("@repo/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
  consumeRateLimit: vi.fn(async () => true),
  isAuthApiError: () => false,
}))

// `health.ping` over HTTP, as another client would call it.
function ping(headers: Record<string, string> = {}) {
  return handleRequest(
    new Request("http://localhost/api/rpc/health/ping", {
      method: "POST",
      headers: { "content-type": "application/json", ...headers },
      body: JSON.stringify({}),
    })
  )
}

describe("handleRequest", () => {
  it("answers this site and non-browser clients", async () => {
    expect((await ping()).status).toBe(200)
    expect((await ping({ "sec-fetch-site": "same-origin" })).status).toBe(200)
  })

  it("refuses a browser request made by another site", async () => {
    const response = await ping({ "sec-fetch-site": "cross-site" })

    expect(response.status).toBe(403)
    expect(consumeRateLimit).not.toHaveBeenCalled()
  })

  it("refuses once the caller's rate limit is spent", async () => {
    vi.mocked(consumeRateLimit).mockResolvedValueOnce(false)

    expect((await ping()).status).toBe(429)
  })

  it("does not route unknown paths", async () => {
    const response = await handleRequest(
      new Request("http://localhost/api/rpc/nope", { method: "POST" })
    )

    expect(response.status).toBe(404)
  })
})
