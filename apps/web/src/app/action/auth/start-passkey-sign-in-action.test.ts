import { auth, consumeRateLimit } from "@repo/auth"
import { describe, expect, it, vi } from "vitest"
import { startPasskeySignInAction } from "./start-passkey-sign-in-action"

vi.mock("next/headers", () => ({ headers: async () => new Headers() }))
vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => key,
}))
vi.mock("@repo/auth", () => ({
  auth: {
    api: {
      generatePasskeyAuthenticationOptions: vi.fn(async () => ({
        challenge: "challenge-1",
      })),
    },
  },
  consumeRateLimit: vi.fn(async () => true),
  getAuthApiErrorMessage: () => undefined,
}))

describe("startPasskeySignInAction", () => {
  it("counts the attempt and returns the WebAuthn options", async () => {
    const result = await startPasskeySignInAction()

    expect(consumeRateLimit).toHaveBeenCalledWith(
      "passkeySignIn",
      expect.any(Headers)
    )
    expect(result).toEqual({
      success: true,
      options: { challenge: "challenge-1" },
    })
  })

  it("stores no challenge once the rate limit is spent", async () => {
    vi.mocked(consumeRateLimit).mockResolvedValueOnce(false)

    const result = await startPasskeySignInAction()

    expect(result).toEqual({ success: false, error: "tooManyAttempts" })
    expect(auth.api.generatePasskeyAuthenticationOptions).not.toHaveBeenCalled()
  })
})
