"use client"

import { useState, useTransition } from "react"
import { FingerprintIcon } from "lucide-react"
import {
  browserSupportsWebAuthn,
  startAuthentication,
} from "@simplewebauthn/browser"
import { signInWithPasskeyAction } from "@/app/action/auth/sign-in-with-passkey-action"
import { startPasskeySignInAction } from "@/app/action/auth/start-passkey-sign-in-action"
import { isPasskeyPromptDismissed } from "@/lib/passkey-prompt"
import { Alert, AlertDescription } from "@repo/ui/components/alert"
import { Badge } from "@repo/ui/components/badge"
import { Button } from "@repo/ui/components/button"
import { Spinner } from "@repo/ui/components/spinner"
import { useTranslations } from "next-intl"

type PasskeySignInProps = {
  redirectTo: string
  lastLoginMethod?: string | null
}

/**
 * The browser lists the passkeys it holds for this site; no email needed.
 * Renders grid items for `OtherSignInMethods`: the button joins the row of
 * sign-in buttons, and an error spans the row below them.
 */
export function PasskeySignIn({
  redirectTo,
  lastLoginMethod = null,
}: PasskeySignInProps) {
  const t = useTranslations("auth.passkey")
  const tSocial = useTranslations("auth.social")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSignIn = () => {
    setError(null)
    startTransition(async () => {
      if (!browserSupportsWebAuthn()) {
        setError(t("unsupported"))
        return
      }

      const started = await startPasskeySignInAction()
      if (!started.success) {
        setError(started.error ?? t("failed"))
        return
      }

      let response
      try {
        response = await startAuthentication({ optionsJSON: started.options })
      } catch (cause) {
        if (!isPasskeyPromptDismissed(cause)) {
          setError(t("failed"))
        }
        return
      }

      // Redirects on success; only a failure comes back.
      const result = await signInWithPasskeyAction(response, redirectTo)
      if (result) {
        setError(result.error ?? t("failed"))
      }
    })
  }

  return (
    <>
      <div className="relative order-first">
        <Button
          type="button"
          variant="outline"
          className="w-full"
          disabled={isPending}
          aria-busy={isPending}
          onClick={handleSignIn}
        >
          {isPending ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <FingerprintIcon data-icon="inline-start" aria-hidden />
          )}
          {t("signIn")}
        </Button>
        {lastLoginMethod === "passkey" ? (
          <Badge
            variant="secondary"
            className="pointer-events-none absolute end-2 top-0 z-10 -translate-y-1/2"
          >
            {tSocial("lastUsed")}
          </Badge>
        ) : null}
      </div>
      {error ? (
        <Alert variant="destructive" className="col-span-full">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </>
  )
}
