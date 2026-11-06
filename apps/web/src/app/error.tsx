"use client"

import { useEffect } from "react"
import { Button } from "@repo/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card"
import { RotateCcwIcon } from "lucide-react"
import { useTranslations } from "next-intl"

/**
 * `error` is whatever was thrown: an `Error` with `digest` from Server
 * Components, any value from Client Components.
 */
export default function ErrorPage({
  error,
  retry,
}: {
  error: unknown
  retry: () => void
}) {
  const t = useTranslations("common")

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{t("errors.title")}</CardTitle>
          <CardDescription>{t("errors.description")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {process.env.NODE_ENV === "development" &&
          error instanceof Error &&
          error.message ? (
            <p className="text-sm text-muted-foreground">{error.message}</p>
          ) : null}
          <Button type="button" onClick={() => retry()}>
            <RotateCcwIcon data-icon="inline-start" />
            {t("tryAgain")}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
