"use client"

import type { InferS3Routes } from "@dimah-s3/core"
import { dbClient } from "@dimah-s3/db/client"
import { createS3Client } from "@dimah-s3/react"
import type { Locale } from "@repo/i18n"
import type { s3 } from "./s3"
import { translationsByLocale } from "./translations"

// Route names come from the server instance: a new route needs no edit here.
declare module "@dimah-s3/core" {
  // Declaration merging needs an interface; a type alias cannot augment it.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface DimahS3Routes extends Record<InferS3Routes<typeof s3>, true> {}
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
