import { call } from "@orpc/server"
import type { Session } from "@repo/auth"
import { describe, expect, it, vi } from "vitest"
import { authed, createContext, member, requirePermission } from "./base"

// The real `@repo/auth` builds Better Auth and a database pool on import.
const getSession = vi.hoisted(() => vi.fn<() => Promise<Session | null>>())
const getActiveMember = vi.hoisted(() => vi.fn())
const hasPermission = vi.hoisted(() => vi.fn())
const AuthRefusal = vi.hoisted(() => class AuthRefusal extends Error {})
vi.mock("@repo/auth", () => ({
  auth: { api: { getSession, getActiveMember, hasPermission } },
  isAuthApiError: (error: unknown) => error instanceof AuthRefusal,
}))

const whoAmI = authed.handler(({ context }) => context.session.user.id)
const whichOrganization = member.handler(
  ({ context }) => context.organizationId
)
const updateMembers = member
  .use(requirePermission({ member: ["update"] }))
  .handler(() => "updated")

function sessionIn(activeOrganizationId: string | null) {
  return {
    user: { id: "user-1" },
    session: { activeOrganizationId },
  } as Session
}

const context = () => createContext(new Headers())

describe("createContext", () => {
  it("looks the session up once per request", async () => {
    getSession.mockResolvedValue(null)
    const shared = context()

    await Promise.all([shared.getSession(), shared.getSession()])

    expect(getSession).toHaveBeenCalledTimes(1)
  })
})

describe("authed", () => {
  it("rejects a caller without a session", async () => {
    getSession.mockResolvedValue(null)

    await expect(
      call(whoAmI, undefined, { context: context() })
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" })
  })

  it("hands the session to the procedure", async () => {
    getSession.mockResolvedValue({ user: { id: "user-1" } } as Session)

    await expect(call(whoAmI, undefined, { context: context() })).resolves.toBe(
      "user-1"
    )
  })
})

describe("member", () => {
  it("rejects a session without an active organization", async () => {
    getSession.mockResolvedValue(sessionIn(null))

    await expect(
      call(whichOrganization, undefined, { context: context() })
    ).rejects.toMatchObject({ code: "FORBIDDEN" })
    expect(getActiveMember).not.toHaveBeenCalled()
  })

  it("rejects an organization the user has left", async () => {
    getSession.mockResolvedValue(sessionIn("org-1"))
    getActiveMember.mockRejectedValue(new AuthRefusal("MEMBER_NOT_FOUND"))

    await expect(
      call(whichOrganization, undefined, { context: context() })
    ).rejects.toMatchObject({ code: "FORBIDDEN" })
  })

  it("does not turn a database failure into a refusal", async () => {
    getSession.mockResolvedValue(sessionIn("org-1"))
    getActiveMember.mockRejectedValue(new Error("connection lost"))

    await expect(
      call(whichOrganization, undefined, { context: context() })
    ).rejects.toThrow("connection lost")
  })

  it("scopes the procedure to the active organization", async () => {
    getSession.mockResolvedValue(sessionIn("org-1"))
    getActiveMember.mockResolvedValue({ organizationId: "org-1" })

    await expect(
      call(whichOrganization, undefined, { context: context() })
    ).resolves.toBe("org-1")
  })
})

describe("requirePermission", () => {
  it("asks Better Auth about the active organization", async () => {
    getSession.mockResolvedValue(sessionIn("org-1"))
    getActiveMember.mockResolvedValue({ organizationId: "org-1" })
    hasPermission.mockResolvedValue({ success: true })

    await expect(
      call(updateMembers, undefined, { context: context() })
    ).resolves.toBe("updated")
    expect(hasPermission).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { organizationId: "org-1", permissions: { member: ["update"] } },
      })
    )
  })

  it("rejects a role without the permission", async () => {
    getSession.mockResolvedValue(sessionIn("org-1"))
    getActiveMember.mockResolvedValue({ organizationId: "org-1" })
    hasPermission.mockResolvedValue({ success: false })

    await expect(
      call(updateMembers, undefined, { context: context() })
    ).rejects.toMatchObject({ code: "FORBIDDEN" })
  })
})
