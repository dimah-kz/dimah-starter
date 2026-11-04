import { onError } from "@orpc/server"
import { RPCHandler } from "@orpc/server/fetch"
import {
  RequestLimitHandlerPlugin,
  SignalSyncHandlerPlugin,
} from "@orpc/server/plugins"
import { createContext } from "./base"
import { prefix } from "./prefix"
import { router } from "./router"

export { createContext } from "./base"
export type { Context } from "./base"
export { createRouterClient } from "@orpc/server"
export { router }

/** Product JSON stays under 1 MiB. Object bytes go through `@repo/storage`. */
const maxBodySize = 1024 * 1024

const handler = new RPCHandler(router, {
  interceptors: [
    onError((error) => {
      console.error(error)
    }),
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
