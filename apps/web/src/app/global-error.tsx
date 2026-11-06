"use client"

import "@repo/ui/globals.css"
import { useEffect } from "react"
import { Button } from "@repo/ui/components/button"

/**
 * Replaces the root layout when it throws, so there is no intl provider or
 * theme here: static English copy only.
 */
export default function GlobalError({
  error,
  retry,
}: {
  error: unknown
  retry: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en" dir="ltr">
      <body className="flex min-h-svh flex-col items-center justify-center gap-4 p-6 text-center antialiased">
        <title>Something went wrong</title>
        <h1 className="text-lg font-semibold">Something went wrong</h1>
        <p className="max-w-sm text-sm text-muted-foreground">
          The app could not load. Try again, or reload the page.
        </p>
        <Button type="button" onClick={() => retry()}>
          Try again
        </Button>
      </body>
    </html>
  )
}
