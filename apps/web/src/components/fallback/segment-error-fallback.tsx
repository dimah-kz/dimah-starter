"use client"

import { Button } from "@repo/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card"
import { useTranslations } from "next-intl"

type SegmentErrorFallbackProps = {
  title: string
  description: string
  error: Error & { digest?: string }
  retry: () => void
}

export function SegmentErrorFallback({
  title,
  description,
  error,
  retry,
}: SegmentErrorFallbackProps) {
  const t = useTranslations("common")

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {process.env.NODE_ENV === "development" && error.message ? (
            <p className="text-sm text-muted-foreground">{error.message}</p>
          ) : null}
          <Button type="button" onClick={retry}>
            {t("tryAgain")}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
