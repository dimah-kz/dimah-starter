import { onError, ORPCError } from "@orpc/server"
import { RPCHandler } from "@orpc/server/fetch"
import {
  RequestLimitHandlerPlugin,
  SignalSyncHandlerPlugin,
} from "@orpc/server/plugins"
import { consumeRateLimit } from "@repo/auth"
import { createContext, type Context } from "./base"
import { prefix } from "./prefix"
import { router } from "./router"

export { createContext } from "./base"
export type { Context } from "./base"
export { createRouterClient } from "@orpc/server"
export { router }

/** Product JSON stays under 1 MiB. Object bytes go through `@repo/storage`. */
const maxBodySize = 1024 * 1024

const handler = new RPCHandler<Context>(router, {
  interceptors: [
    onError((error) => {
      // Refusals (input, auth, limits) are the caller's; log what broke here.
      if (
        !(error instanceof ORPCError) ||
        error.code === "INTERNAL_SERVER_ERROR"
      ) {
        console.error(error)
      }
    }),
    async ({ context, next }) => {
      // Browsers label requests another site makes. The API serves this site
      // and non-browser clients; to serve another site's browser app, add
      // `CORSHandlerPlugin` for its origin and let it through here.
      if (context.headers.get("sec-fetch-site") === "cross-site") {
        throw new ORPCError("FORBIDDEN")
      }

      if (!(await consumeRateLimit("api", context.headers))) {
        throw new ORPCError("TOO_MANY_REQUESTS")
      }

      return next()
    },
  ],
  plugins: [
    new RequestLimitHandlerPlugin({ maxBodySize }),
    new SignalSyncHandlerPlugin(),
  ],
})

export async function handleRequest(request: Request): Promise<Response> {
  const { matched, response } = await handler.handle(request, {
    prefix,
    context: createContext(request.headers),
  })

  if (!matched) {
    return new Response(null, { status: 404 })
  }

  return response
}
