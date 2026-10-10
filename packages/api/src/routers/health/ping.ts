import * as z from "zod"
import { pub } from "../../base"

export const ping = pub
  .output(z.object({ ok: z.literal(true) }))
  .handler(async () => ({ ok: true as const }))
