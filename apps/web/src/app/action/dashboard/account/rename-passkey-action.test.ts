import { refresh } from "next/cache"
import { auth } from "@repo/auth"
import { describe, expect, it, vi } from "vitest"
import { renamePasskeyAction } from "./rename-passkey-action"

vi.mock("next/headers", () => ({ headers: async () => new Headers() }))
vi.mock("next/cache", () => ({ refresh: vi.fn() }))
vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => key,
}))
vi.mock("@repo/auth", () => ({
  auth: { api: { updatePasskey: vi.fn() } },
  getAuthApiErrorMessage: () => undefined,
}))

function renameForm(name: string) {
  const formData = new FormData()
  formData.set("id", "passkey-1")
  formData.set("name", name)
  return formData
}

describe("renamePasskeyAction", () => {
  it.each(["", "   ", "x".repeat(101)])(
    "rejects the name %j before calling Better Auth",
    async (name) => {
      const result = await renamePasskeyAction(renameForm(name))

      expect(result).toEqual({ success: false, error: "nameInvalid" })
      expect(auth.api.updatePasskey).not.toHaveBeenCalled()
    }
  )

  it("saves the trimmed name and refreshes the list", async () => {
    const result = await renamePasskeyAction(renameForm("  Work laptop  "))

    expect(result).toEqual({ success: true })
    expect(auth.api.updatePasskey).toHaveBeenCalledWith(
      expect.objectContaining({
        body: { id: "passkey-1", name: "Work laptop" },
      })
    )
    expect(refresh).toHaveBeenCalled()
  })
})
