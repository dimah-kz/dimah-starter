import { createORPCClient as createClient } from "@orpc/client"
import { RPCLink } from "@orpc/client/fetch"
import type { ClientContext } from "@orpc/client"
import type { RPCLinkOptions } from "@orpc/client/fetch"
import type { RouterClient } from "@orpc/server"
import { prefix } from "./prefix"
import type { router } from "./router"

export function createORPCClient<
  TContext extends ClientContext = Record<never, never>,
>(options: {
  origin: string
  headers?: RPCLinkOptions<TContext>["headers"]
}): RouterClient<typeof router, TContext> {
  const link = new RPCLink<TContext>({
    origin: options.origin,
    url: prefix,
    headers: options.headers,
  })

  return createClient(link)
}
