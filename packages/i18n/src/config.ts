export const locales = ["en", "fa"] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = "en"

export const localeCookieName = "NEXT_LOCALE"

export const directions = {
  en: "ltr",
  fa: "rtl",
} as const satisfies Record<Locale, "ltr" | "rtl">

export function isValidLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value)
}

export function resolveLocale(value: string | undefined | null): Locale {
  if (value && isValidLocale(value)) {
    return value
  }

  return defaultLocale
}

export function resolveLocaleFromHeaders(headers: {
  get(name: string): string | null
}): Locale {
  for (const part of (headers.get("cookie") ?? "").split(";")) {
    const [name, ...rest] = part.trim().split("=")

    if (name === localeCookieName) {
      try {
        return resolveLocale(decodeURIComponent(rest.join("=")))
      } catch {
        // Malformed percent-encoding (`URIError`): ignore the cookie.
        return defaultLocale
      }
    }
  }

  return defaultLocale
}

export function getLocaleDirection(locale: Locale) {
  return directions[locale]
}
