import { redirect } from "next/navigation"
import { auth, consumeRateLimit } from "@repo/auth"
import { describe, expect, it, vi } from "vitest"
import { verifyTwoFactorAction } from "./verify-two-factor-action"

vi.mock("next/headers", () => ({ headers: async () => new Headers() }))
vi.mock("next/navigation", () => ({ redirect: vi.fn() }))
vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => key,
}))
vi.mock("@repo/auth", () => ({
  auth: { api: { verifyTOTP: vi.fn(), verifyBackupCode: vi.fn() } },
  consumeRateLimit: vi.fn(async () => true),
  getAuthApiErrorMessage: () => undefined,
}))

function codeForm(fields: Record<string, string>) {
  const formData = new FormData()
  for (const [name, value] of Object.entries(fields)) {
    formData.set(name, value)
  }
  return formData
}

describe("verifyTwoFactorAction", () => {
  it("rejects an empty code before counting or checking it", async () => {
    const result = await verifyTwoFactorAction({}, codeForm({ code: "  " }))

    expect(result).toEqual({ formError: "twoFactor.invalid" })
    expect(consumeRateLimit).not.toHaveBeenCalled()
    expect(auth.api.verifyTOTP).not.toHaveBeenCalled()
  })

  it("stops when the rate limit is spent", async () => {
    vi.mocked(consumeRateLimit).mockResolvedValueOnce(false)

    const result = await verifyTwoFactorAction({}, codeForm({ code: "123456" }))

    expect(result).toEqual({ formError: "errors.tooManyAttempts" })
    expect(auth.api.verifyTOTP).not.toHaveBeenCalled()
  })

  it("checks an authenticator code, trusting the device when asked", async () => {
    await verifyTwoFactorAction(
      {},
      codeForm({
        code: "123 456",
        trustDevice: "on",
        redirectTo: "/dashboard/account/security",
      })
    )

    expect(auth.api.verifyTOTP).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { code: "123456", trustDevice: true },
      })
    )
    expect(redirect).toHaveBeenCalledWith("/dashboard/account/security")
  })

  it("checks a backup code with the backup method", async () => {
    await verifyTwoFactorAction(
      {},
      codeForm({ code: "abcde-12345", method: "backup" })
    )

    expect(auth.api.verifyBackupCode).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { code: "abcde-12345", trustDevice: false },
      })
    )
    expect(auth.api.verifyTOTP).not.toHaveBeenCalled()
  })

  it("stays on the form when the code is wrong", async () => {
    vi.mocked(auth.api.verifyTOTP).mockRejectedValueOnce(new Error("invalid"))

    const result = await verifyTwoFactorAction({}, codeForm({ code: "000000" }))

    expect(result).toEqual({ formError: "twoFactor.invalid" })
    expect(redirect).not.toHaveBeenCalled()
  })
})
