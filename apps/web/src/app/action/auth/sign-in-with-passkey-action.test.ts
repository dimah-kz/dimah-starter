import { redirect } from "next/navigation"
import type { AuthenticationResponseJSON } from "@simplewebauthn/browser"
import { auth } from "@repo/auth"
import { describe, expect, it, vi } from "vitest"
import { signInWithPasskeyAction } from "./sign-in-with-passkey-action"

vi.mock("next/headers", () => ({ headers: async () => new Headers() }))
vi.mock("next/navigation", () => ({ redirect: vi.fn() }))
vi.mock("@repo/auth", () => ({
  auth: { api: { verifyPasskeyAuthentication: vi.fn() } },
  getAuthApiErrorMessage: () => undefined,
}))

const response = { id: "credential-1" } as AuthenticationResponseJSON

describe("signInWithPasskeyAction", () => {
  it("passes the browser's response to Better Auth", async () => {
    await signInWithPasskeyAction(response, "/dashboard")

    expect(auth.api.verifyPasskeyAuthentication).toHaveBeenCalledWith(
      expect.objectContaining({ body: { response } })
    )
  })

  it.each([
    ["/dashboard/account/security", "/dashboard/account/security"],
    ["https://evil.example", "/dashboard"],
    ["//evil.example", "/dashboard"],
  ])("redirects %j to %j", async (target, expected) => {
    await signInWithPasskeyAction(response, target)

    expect(redirect).toHaveBeenCalledWith(expected)
  })

  it("stays on the page when the passkey is refused", async () => {
    vi.mocked(auth.api.verifyPasskeyAuthentication).mockRejectedValueOnce(
      new Error("unknown passkey")
    )

    const result = await signInWithPasskeyAction(response, "/dashboard")

    expect(result).toEqual({ success: false, error: undefined })
    expect(redirect).not.toHaveBeenCalled()
  })
})
