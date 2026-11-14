import { revalidateTag } from "next/cache"
import { redirect } from "next/navigation"
import { after } from "next/server"
import { auth } from "@repo/auth"
import { describe, expect, it, vi } from "vitest"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { deleteAccountAction } from "./delete-account-action"

vi.mock("next/headers", () => ({ headers: async () => new Headers() }))
vi.mock("next/cache", () => ({ revalidateTag: vi.fn() }))
vi.mock("next/navigation", () => ({ redirect: vi.fn() }))
vi.mock("next/server", () => ({ after: vi.fn() }))
vi.mock("@repo/storage", () => ({ deleteOwnedObjects: vi.fn() }))
vi.mock("@repo/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(async () => ({ user: { id: "user-1" } })),
      deleteUser: vi.fn(),
    },
  },
  getAuthApiErrorMessage: () => undefined,
}))

function tokenForm(token: string) {
  const formData = new FormData()
  formData.set("token", token)
  return formData
}

describe("deleteAccountAction", () => {
  it("needs the token from the mail", async () => {
    const result = await deleteAccountAction(tokenForm(""))

    expect(result).toEqual({ success: false })
    expect(auth.api.deleteUser).not.toHaveBeenCalled()
  })

  it("deletes with the token, cleans up and signs out to login", async () => {
    await deleteAccountAction(tokenForm("token-1"))

    expect(auth.api.deleteUser).toHaveBeenCalledWith(
      expect.objectContaining({ body: { token: "token-1" } })
    )
    expect(after).toHaveBeenCalled()
    expect(revalidateTag).toHaveBeenCalledWith(
      dashboardCacheTags.adminUsersPage(),
      "max"
    )
    expect(redirect).toHaveBeenCalledWith("/login?notice=account-deleted")
  })

  it("keeps everything when Better Auth refuses", async () => {
    vi.mocked(auth.api.deleteUser).mockRejectedValueOnce(new Error("owner"))

    const result = await deleteAccountAction(tokenForm("token-1"))

    expect(result).toEqual({ success: false, error: undefined })
    expect(after).not.toHaveBeenCalled()
    expect(redirect).not.toHaveBeenCalled()
  })
})
