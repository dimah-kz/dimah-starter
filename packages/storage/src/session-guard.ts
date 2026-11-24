import { s3Error, type Guard, type GuardContext } from "@dimah-s3/server"
import { auth, consumeRateLimit } from "@repo/auth"
import "./locals"

/**
 * Instance guard: counts the call against the `storage` rate limit, then
 * reads the session once per call into `locals`. Route guards and
 * `resolveScope` read `locals`, never the session again.
 */
export const sessionGuard: Guard<GuardContext> = async ({ request }) => {
  if (!(await consumeRateLimit("storage", request.headers))) {
    throw s3Error("TOO_MANY_REQUESTS")
  }
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) throw s3Error("UNAUTHORIZED")
  return {
    locals: {
      userId: session.user.id,
      organizationId: session.session.activeOrganizationId,
    },
  }
}
