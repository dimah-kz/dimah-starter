import { cacheLife } from "next/cache"
import { headers } from "next/headers"
import { getRequestConfig } from "next-intl/server"
import { loadMessages, resolveLocaleFromHeaders } from "@repo/i18n"

/**
 * Locale comes from the request cookie. A bare `headers()` read stays out of the
 * runtime shell, so every translated layout is dropped from instant validation.
 * The private cache is part of that shell and still follows the cookie.
 */
async function readRequestLocale() {
  "use cache: private"
  cacheLife({ stale: Infinity })

  return resolveLocaleFromHeaders(await headers())
}

export default getRequestConfig(async () => {
  const locale = await readRequestLocale()

  return {
    locale,
    messages: loadMessages(locale),
  }
})
