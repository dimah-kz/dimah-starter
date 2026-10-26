import { onError } from "@orpc/server"
import { RPCHandler } from "@orpc/server/fetch"
import { SignalSyncHandlerPlugin } from "@orpc/server/plugins"
import { createContext } from "./base"
import { prefix } from "./prefix"
import { router } from "./router"

export { createContext } from "./base"
export type { Context } from "./base"
export { createRouterClient } from "@orpc/server"
export { router }

const handler = new RPCHandler(router, {
  interceptors: [
    onError((error) => {
      console.error(error)
    }),
  ],
  plugins: [new SignalSyncHandlerPlugin()],
})

export async function handleRequest(request: Request): Promise<Response> {
  const { response } = await handler.handle(request, {
    prefix,
    context: createContext(request.headers),
  })

  return response ?? new Response(null, { status: 404 })
}
