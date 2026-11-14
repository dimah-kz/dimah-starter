import { revalidateTag, updateTag } from "next/cache"
import { auth } from "@repo/auth"
import { describe, expect, it, vi } from "vitest"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { updateProfileAction } from "./update-profile-action"

// A Server Action unit test replaces the request (`next/headers`), the cache
// APIs, translations and `auth.api`, then checks what the action asked of them.
vi.mock("next/headers", () => ({ headers: async () => new Headers() }))
vi.mock("next/cache", () => ({ revalidateTag: vi.fn(), updateTag: vi.fn() }))
vi.mock("next-intl/server", () => ({
  getTranslations: async () => (key: string) => key,
}))
vi.mock("@repo/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(async () => ({ user: { id: "user-1" } })),
      updateUser: vi.fn(),
    },
  },
  getAuthApiErrorMessage: () => undefined,
}))

function formWithName(name: string) {
  const formData = new FormData()
  formData.set("name", name)
  return formData
}

describe("updateProfileAction", () => {
  it.each(["", "   ", "x".repeat(101)])(
    "rejects the name %j before calling Better Auth",
    async (name) => {
      const result = await updateProfileAction(formWithName(name))

      expect(result).toEqual({ success: false, error: "nameInvalid" })
      expect(auth.api.updateUser).not.toHaveBeenCalled()
    }
  )

  it("saves the trimmed name and refreshes every view of it", async () => {
    const result = await updateProfileAction(formWithName("  Ada  "))

    expect(result).toEqual({ success: true })
    expect(auth.api.updateUser).toHaveBeenCalledWith(
      expect.objectContaining({ body: { name: "Ada" } })
    )
    expect(updateTag).toHaveBeenCalledWith(
      dashboardCacheTags.userProfileById("user-1")
    )
    expect(revalidateTag).toHaveBeenCalledWith(
      dashboardCacheTags.adminUsersPage(),
      "max"
    )
  })

  it("passes a Better Auth failure back without refreshing", async () => {
    vi.mocked(auth.api.updateUser).mockRejectedValueOnce(new Error("db down"))

    const result = await updateProfileAction(formWithName("Ada"))

    expect(result).toEqual({ success: false, error: undefined })
    expect(updateTag).not.toHaveBeenCalled()
  })
})
