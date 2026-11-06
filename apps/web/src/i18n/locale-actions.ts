"use server"

import { refresh } from "next/cache"
import { isValidLocale, localeCookieName, type Locale } from "@repo/i18n"
import { cookies } from "next/headers"

export async function setLocale(locale: Locale) {
  if (!isValidLocale(locale)) {
    return
  }

  const store = await cookies()
  store.set(localeCookieName, locale, {
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 365,
  })
  // Drops the privately cached locale shell so the new cookie is used at once.
  refresh()
}
