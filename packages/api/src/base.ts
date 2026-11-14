import { ORPCError, os } from "@orpc/server"
import { auth, isAuthApiError, type Session } from "@repo/auth"
import type { orgStatements } from "@repo/auth/organization-access"

export type Context = {
  headers: Headers
  getSession: () => Promise<Session | null>
}

/** One `getSession` lookup per object, shared by repeated middleware and batch sub-requests. */
export function createContext(headers: Headers): Context {
  let session: Promise<Session | null> | undefined

  return {
    headers,
    getSession() {
      session ??= auth.api.getSession({ headers })
      return session
    },
  }
}

export const pub = os.$context<Context>()

export const authed = pub.use(async ({ context, next }) => {
  const session = await context.getSession()

  if (!session) {
    throw new ORPCError("UNAUTHORIZED")
  }

  return next({ context: { session } })
})

/**
 * Requires a session whose active organization the caller still belongs to,
 * and adds its `organizationId`. Scope every product query by this id, never
 * by an organization id from the input: that is what keeps tenants apart.
 */
export const member = authed.use(async ({ context, next }) => {
  const organizationId = context.session.session.activeOrganizationId

  if (!organizationId) {
    throw new ORPCError("FORBIDDEN", { message: "No active organization." })
  }

  // The session can still name an organization the user has left.
  const membership = await auth.api
    .getActiveMember({ headers: context.headers })
    .catch((error: unknown) => {
      if (isAuthApiError(error)) return null
      throw error
    })

  if (membership?.organizationId !== organizationId) {
    throw new ORPCError("FORBIDDEN")
  }

  return next({ context: { organizationId } })
})

/** Actions per resource from `organization-access.ts`, e.g. `{ member: ["update"] }`. */
export type OrganizationPermissions = {
  [Resource in keyof typeof orgStatements]?: Array<
    (typeof orgStatements)[Resource][number]
  >
}

/**
 * Requires the caller's role in the active organization to grant
 * `permissions`. Use it on `member`: `member.use(requirePermission({ … }))`.
 */
export function requirePermission(permissions: OrganizationPermissions) {
  return os
    .$context<Context & { organizationId: string }>()
    .middleware(async ({ context, next }) => {
      const { success } = await auth.api.hasPermission({
        headers: context.headers,
        body: { organizationId: context.organizationId, permissions },
      })

      if (!success) {
        throw new ORPCError("FORBIDDEN")
      }

      return next()
    })
}
