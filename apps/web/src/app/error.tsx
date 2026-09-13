"use client"

import { SegmentErrorFallback } from "@/components/fallback/segment-error-fallback"
import { useTranslations } from "next-intl"

type ErrorPageProps = {
  error: Error & { digest?: string }
  retry: () => void
}

export default function ErrorPage({ error, retry }: ErrorPageProps) {
  const t = useTranslations("common.errors")

  return (
    <SegmentErrorFallback
      title={t("title")}
      description={t("description")}
      error={error}
      retry={retry}
    />
  )
}
