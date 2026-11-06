"use client"

import { getLocaleDirection } from "@repo/i18n"
import { useLocale } from "next-intl"
import { useLayoutEffect } from "react"

/**
 * The root layout's inline script sets `lang` / `dir` before the first paint.
 * React never updates them afterwards (the `<html>` props are static), so this
 * re-applies them after a client-side locale switch and after the dev-only
 * Strict Mode remount, which resets `<html>` attributes.
 */
export function HtmlLocaleSync() {
  const locale = useLocale()

  useLayoutEffect(() => {
    document.documentElement.lang = locale
    document.documentElement.dir = getLocaleDirection(locale)
  }, [locale])

  return null
}
