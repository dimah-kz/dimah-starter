import { ORPCError, os } from "@orpc/server"
import { auth, type Session } from "@repo/auth"

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
