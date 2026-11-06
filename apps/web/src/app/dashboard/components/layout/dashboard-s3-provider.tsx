"use client"

import type { ReactNode } from "react"
import type { Locale } from "@repo/i18n"
import { S3ClientProvider } from "@repo/storage/s3-client"
import { useLocale } from "next-intl"

/** Locale comes from the root intl provider, so this does not read the request. */
export function DashboardS3Provider({ children }: { children: ReactNode }) {
  const locale = useLocale() as Locale

  return <S3ClientProvider locale={locale}>{children}</S3ClientProvider>
}
