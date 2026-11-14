"use client"

import { useActionState } from "react"
import { signInWithGoogleAction } from "@/app/action/auth/sign-in-with-google-action"
import { AUTH_FORM_INITIAL_STATE } from "@/app/(auth)/lib/auth-form-state"
import { GoogleMark } from "@/components/google-mark"
import { Alert, AlertDescription } from "@repo/ui/components/alert"
import { Badge } from "@repo/ui/components/badge"
import { Button } from "@repo/ui/components/button"
import { Spinner } from "@repo/ui/components/spinner"
import { useTranslations } from "next-intl"

const SILENT_OAUTH_ERRORS = new Set(["access_denied"])

type GoogleSignInProps = {
  redirectTo: string
  returnPath: string
  lastLoginMethod?: string | null
  oauthError?: string | null
}

export function GoogleSignIn({
  redirectTo,
  returnPath,
  lastLoginMethod = null,
  oauthError = null,
}: GoogleSignInProps) {
  const t = useTranslations("auth.social")
  const [state, formAction, pending] = useActionState(
    signInWithGoogleAction,
    AUTH_FORM_INITIAL_STATE
  )
  const callbackError =
    oauthError && !SILENT_OAUTH_ERRORS.has(oauthError) ? t("googleError") : null
  const formError = state.formError ?? callbackError

  return (
    <div className="flex flex-col gap-3">
      {formError ? (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}
      <form action={formAction} className="relative">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <input type="hidden" name="returnPath" value={returnPath} />
        <Button
          type="submit"
          variant="outline"
          className="w-full"
          disabled={pending}
          aria-busy={pending}
        >
          <span className="inline-flex items-center gap-1.5">
            {pending ? (
              <Spinner className="size-3.75" />
            ) : (
              <GoogleMark className="size-4" />
            )}
            <span className="-mb-px leading-none">{t("google")}</span>
          </span>
        </Button>
        {lastLoginMethod === "google" ? (
          <Badge
            variant="secondary"
            className="pointer-events-none absolute end-2 top-0 z-10 -translate-y-1/2"
          >
            {t("lastUsed")}
          </Badge>
        ) : null}
      </form>
    </div>
  )
}
