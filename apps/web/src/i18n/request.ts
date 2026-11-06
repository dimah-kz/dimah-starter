import { loadMessages, resolveLocaleFromHeaders } from "@repo/i18n"
import { headers } from "next/headers"
import { getRequestConfig } from "next-intl/server"

export default getRequestConfig(async () => {
  const locale = resolveLocaleFromHeaders(await headers())

  return {
    locale,
    messages: loadMessages(locale),
  }
})
