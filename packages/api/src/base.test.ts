import { call } from "@orpc/server"
import type { Session } from "@repo/auth"
import { describe, expect, it, vi } from "vitest"
import { authed, createContext } from "./base"

// The real `@repo/auth` builds Better Auth and a database pool on import.
const getSession = vi.hoisted(() => vi.fn<() => Promise<Session | null>>())
vi.mock("@repo/auth", () => ({ auth: { api: { getSession } } }))

const whoAmI = authed.handler(({ context }) => context.session.user.id)

describe("createContext", () => {
  it("looks the session up once per request", async () => {
    getSession.mockResolvedValue(null)
    const context = createContext(new Headers())

    await Promise.all([context.getSession(), context.getSession()])

    expect(getSession).toHaveBeenCalledTimes(1)
  })
})

describe("authed", () => {
  it("rejects a caller without a session", async () => {
    getSession.mockResolvedValue(null)

    await expect(
      call(whoAmI, undefined, { context: createContext(new Headers()) })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" })
  })

  it("hands the session to the procedure", async () => {
    getSession.mockResolvedValue({ user: { id: "user-1" } } as Session)

    await expect(
      call(whoAmI, undefined, { context: createContext(new Headers()) })
    ).resolves.toBe("user-1")
  })
})
