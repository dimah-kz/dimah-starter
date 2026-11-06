import type { Translations } from "@dimah-s3/react"
import type { Locale } from "@repo/i18n"
import { fa } from "./fa"

/** Fuma locale map for `s3Client.Provider`. English uses the source keys. */
export const translationsByLocale: Record<
  Locale,
  Partial<Translations> | undefined
> = {
  en: undefined,
  fa,
}
