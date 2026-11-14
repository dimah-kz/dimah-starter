import { describe, expect, it, vi } from "vitest"
import { routeOwners, toRouteOwner } from "./routes"
import { toCallerScope, toScope } from "./scope"

// The `logo` route checks permissions through `@repo/auth`.
vi.mock("@repo/auth", () => ({ auth: {} }))

describe("toScope", () => {
  it("keeps users and organizations apart", () => {
    expect(toScope("user", "1")).toBe("user:1")
    expect(toScope("organization", "1")).toBe("org:1")
  })
})

describe("toCallerScope", () => {
  it("is the caller's own user or active organization", () => {
    const locals = { userId: "u1", organizationId: "o1" }

    expect(toCallerScope("user", locals)).toBe("user:u1")
    expect(toCallerScope("organization", locals)).toBe("org:o1")
  })

  it("is null without an owner, so the upload is refused", () => {
    expect(toCallerScope("organization", { userId: "u1" })).toBeNull()
    expect(toCallerScope("user", {})).toBeNull()
  })
})

describe("toRouteOwner", () => {
  it("reads the owner every route declares", () => {
    for (const [route, owner] of Object.entries(routeOwners)) {
      expect(toRouteOwner(route)).toBe(owner)
    }
  })

  it.each([undefined, "unknown", "__proto__", "toString"])(
    "treats %j as the user's own",
    (route) => {
      expect(toRouteOwner(route)).toBe("user")
    }
  )
})
