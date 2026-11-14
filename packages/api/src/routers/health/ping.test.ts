import { createRouterClient } from "@orpc/server"
import { describe, expect, it, vi } from "vitest"
import { createContext } from "../../base"
import { router } from "../../router"

vi.mock("@repo/auth", () => ({ auth: { api: { getSession: vi.fn() } } }))

// The same in-process client a Server Action uses.
const client = createRouterClient(router, {
  context: createContext(new Headers()),
})

describe("health.ping", () => {
  it("answers without a session", async () => {
    await expect(client.health.ping()).resolves.toEqual({ ok: true })
  })
})
