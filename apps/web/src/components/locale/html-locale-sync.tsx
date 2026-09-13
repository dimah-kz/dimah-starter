"use client"

import { getLocaleDirection, type Locale } from "@repo/i18n"
import { useLocale } from "next-intl"
import { useEffect } from "react"

export function HtmlLocaleSync() {
  const locale = useLocale() as Locale

  useEffect(() => {
    const direction = getLocaleDirection(locale)
    document.documentElement.lang = locale
    document.documentElement.dir = direction
  }, [locale])

  return null
}
