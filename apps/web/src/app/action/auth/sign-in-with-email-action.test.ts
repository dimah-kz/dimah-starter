import { redirect } from "next/navigation"
import { auth } from "@repo/auth"
import { describe, expect, it, vi } from "vitest"
import { signInWithEmailAction } from "./sign-in-with-email-action"

vi.mock("next/headers", () => ({ headers: async () => new Headers() }))
vi.mock("next/navigation", () => ({ redirect: vi.fn() }))
vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => key,
}))
vi.mock("@repo/auth", () => ({
  auth: { api: { signInEmail: vi.fn() } },
  consumeRateLimit: vi.fn(async () => true),
  getAuthApiErrorMessage: () => undefined,
}))

function signInForm(redirectTo: string) {
  const formData = new FormData()
  formData.set("email", "ada@example.com")
  formData.set("password", "correct horse")
  formData.set("redirectTo", redirectTo)
  return formData
}

describe("signInWithEmailAction", () => {
  it("goes to the requested page when no second factor is needed", async () => {
    vi.mocked(auth.api.signInEmail).mockResolvedValueOnce({} as never)

    await signInWithEmailAction({}, signInForm("/dashboard/manage"))

    expect(redirect).toHaveBeenCalledWith("/dashboard/manage")
  })

  it("sends two-factor accounts to the code step, keeping the target", async () => {
    vi.mocked(auth.api.signInEmail).mockResolvedValueOnce({
      twoFactorRedirect: true,
    } as never)

    await signInWithEmailAction({}, signInForm("/dashboard/manage"))

    expect(redirect).toHaveBeenCalledWith(
      "/two-factor?redirect=%2Fdashboard%2Fmanage"
    )
  })

  it("does not carry an off-site target into the code step", async () => {
    vi.mocked(auth.api.signInEmail).mockResolvedValueOnce({
      twoFactorRedirect: true,
    } as never)

    await signInWithEmailAction({}, signInForm("https://evil.example"))

    expect(redirect).toHaveBeenCalledWith("/two-factor")
  })
})
