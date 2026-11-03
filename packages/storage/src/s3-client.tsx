"use client"

import { dbClient } from "@dimah-s3/db/client"
import { createS3Client } from "@dimah-s3/react"
import type { Locale } from "@repo/i18n"
import { translationsByLocale } from "./translations"

declare module "@dimah-s3/core" {
  interface DimahS3Routes {
    avatar: true
    logo: true
  }
}

export const s3Client = createS3Client({
  plugins: [dbClient()],
})

export function S3ClientProvider({
  locale,
  children,
}: {
  locale: Locale
  children: React.ReactNode
}) {
  return (
    <s3Client.Provider
      translations={translationsByLocale[locale]}
      locale={locale}
    >
      {children}
    </s3Client.Provider>
  )
}
