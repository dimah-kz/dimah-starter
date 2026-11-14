import { auth } from "@repo/auth"
import { describe, expect, it, vi } from "vitest"
import { changeEmailAction } from "./change-email-action"

vi.mock("next/headers", () => ({ headers: async () => new Headers() }))
vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => key,
}))
vi.mock("@repo/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(async () => ({ user: { email: "ada@example.com" } })),
      changeEmail: vi.fn(),
    },
  },
  getAuthApiErrorMessage: () => undefined,
}))

function emailForm(email: string) {
  const formData = new FormData()
  formData.set("email", email)
  return formData
}

describe("changeEmailAction", () => {
  it.each([
    "",
    "ada",
    "ada@example",
    "a b@example.com",
    `${"x".repeat(250)}@a.io`,
  ])("rejects %j before calling Better Auth", async (email) => {
    const result = await changeEmailAction(emailForm(email))

    expect(result).toEqual({ success: false, error: "invalid" })
    expect(auth.api.changeEmail).not.toHaveBeenCalled()
  })

  it("rejects the current address in any case", async () => {
    const result = await changeEmailAction(emailForm(" ADA@example.com "))

    expect(result).toEqual({ success: false, error: "same" })
    expect(auth.api.changeEmail).not.toHaveBeenCalled()
  })

  it("starts the change with the lowercased address", async () => {
    const result = await changeEmailAction(emailForm("Grace@Example.com"))

    expect(result).toEqual({ success: true })
    expect(auth.api.changeEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        body: expect.objectContaining({ newEmail: "grace@example.com" }),
      })
    )
  })
})
