import { isS3ErrorCode, type S3ErrorCode } from "@dimah-s3/core"
import { createTestInstance } from "@dimah-s3/server/testing"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { sessionGuard } from "../session-guard"
import { routes } from "."

// The real session guard and route guards, on an in-memory S3. Only Better
// Auth is replaced. Object rows (`@dimah-s3/db`) need Postgres and are left out.
const auth = vi.hoisted(() => ({
  getSession: vi.fn(),
  hasPermission: vi.fn(),
}))
const consumeRateLimit = vi.hoisted(() => vi.fn(async () => true))
vi.mock("@repo/auth", () => ({ auth: { api: auth }, consumeRateLimit }))

// A 1×1 PNG: `verifyContent` checks the bytes against the declared type.
const png = Uint8Array.from(
  atob(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII="
  ),
  (char) => char.charCodeAt(0)
)
const image = { name: "me.png", type: "image/png", body: png }

function signIn(session: { userId: string; organizationId?: string }) {
  auth.getSession.mockResolvedValue({
    user: { id: session.userId },
    session: { activeOrganizationId: session.organizationId ?? null },
  })
}

function canUpdateOrganization(allowed: boolean) {
  auth.hasPermission.mockResolvedValue({ success: allowed })
}

async function expectS3Error(call: Promise<unknown>, code: S3ErrorCode) {
  const error = await call.then(
    () => null,
    (reason: unknown) => reason
  )
  expect(isS3ErrorCode(error, code), String(error)).toBe(true)
}

describe("storage routes", () => {
  let instance: ReturnType<typeof createTestInstance<[], typeof routes>>

  beforeEach(() => {
    instance = createTestInstance({ guard: sessionGuard, routes })
  })

  it("refuses every call without a session", async () => {
    auth.getSession.mockResolvedValue(null)

    await expectS3Error(
      instance.upload({ route: "avatar", ...image }),
      "UNAUTHORIZED"
    )
  })

  it("refuses a call over the storage rate limit before reading the session", async () => {
    signIn({ userId: "u1" })
    auth.getSession.mockClear()
    consumeRateLimit.mockResolvedValueOnce(false)

    await expectS3Error(
      instance.upload({ route: "avatar", ...image }),
      "TOO_MANY_REQUESTS"
    )
    expect(consumeRateLimit).toHaveBeenCalledWith(
      "storage",
      expect.any(Headers)
    )
    expect(auth.getSession).not.toHaveBeenCalled()
  })

  describe("avatar", () => {
    it("stores the upload under the user's folder, cached as immutable", async () => {
      signIn({ userId: "u1" })

      const object = await instance.upload({ route: "avatar", ...image })

      expect(object.key).toMatch(/^avatar\/u1\/[^/]+\/me\.png$/)
      expect(instance.storage.get(object.key)?.cacheControl).toBe(
        "public, max-age=31536000, immutable"
      )
    })

    it("accepts images only, checked against their bytes", async () => {
      signIn({ userId: "u1" })

      await expectS3Error(
        instance.upload({
          route: "avatar",
          name: "a.txt",
          type: "text/plain",
          body: "hello",
        }),
        "FILE_TYPE_NOT_ALLOWED"
      )
      await expectS3Error(
        instance.upload({ route: "avatar", ...image, body: "not a png" }),
        "FILE_CONTENT_MISMATCH"
      )
    })
  })

  describe("logo", () => {
    it("needs an active organization", async () => {
      signIn({ userId: "u1" })

      await expectS3Error(
        instance.upload({ route: "logo", ...image }),
        "FORBIDDEN"
      )
    })

    it("needs organization:update to upload", async () => {
      signIn({ userId: "u1", organizationId: "o1" })
      canUpdateOrganization(false)

      await expectS3Error(
        instance.upload({ route: "logo", ...image }),
        "FORBIDDEN"
      )
      expect(auth.hasPermission).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            organizationId: "o1",
            permissions: { organization: ["update"] },
          },
        })
      )
    })

    it("stores the upload under the organization's folder", async () => {
      signIn({ userId: "u1", organizationId: "o1" })
      canUpdateOrganization(true)

      const object = await instance.upload({ route: "logo", ...image })

      expect(object.key).toMatch(/^logo\/o1\/[^/]+\/me\.png$/)
    })

    it("lets members read it, and only managers delete it", async () => {
      signIn({ userId: "u1", organizationId: "o1" })
      canUpdateOrganization(true)
      const { key } = await instance.upload({ route: "logo", ...image })

      canUpdateOrganization(false)

      await expect(
        instance.client.download({ route: "logo", key })
      ).resolves.toBeTruthy()
      await expectS3Error(
        instance.client.delete({ route: "logo", key }),
        "FORBIDDEN"
      )
      expect(instance.storage.get(key)).toBeDefined()
    })
  })
})
