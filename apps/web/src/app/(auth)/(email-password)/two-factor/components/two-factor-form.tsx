"use client"

import { useActionState, useRef, useState } from "react"
import { verifyTwoFactorAction } from "@/app/action/auth/verify-two-factor-action"
import { AUTH_FORM_INITIAL_STATE } from "@/app/(auth)/lib/auth-form-state"
import { FormSubmitButton } from "@/components/form/form-submit-button"
import { OneTimeCodeInput } from "@/components/form/one-time-code-input"
import { Alert, AlertDescription } from "@repo/ui/components/alert"
import { Button } from "@repo/ui/components/button"
import { Checkbox } from "@repo/ui/components/checkbox"
import { Field, FieldGroup, FieldLabel } from "@repo/ui/components/field"
import { Input } from "@repo/ui/components/input"
import { useTranslations } from "next-intl"

type TwoFactorFormProps = {
  redirectTo: string
}

export function TwoFactorForm({ redirectTo }: TwoFactorFormProps) {
  const t = useTranslations("auth.twoFactor")
  const formRef = useRef<HTMLFormElement>(null)
  const [method, setMethod] = useState<"totp" | "backup">("totp")
  const [code, setCode] = useState("")
  const [state, formAction] = useActionState(
    verifyTwoFactorAction,
    AUTH_FORM_INITIAL_STATE
  )

  // A failed try clears the code, so the next one can be typed at once.
  const [answeredState, setAnsweredState] = useState(state)
  if (state !== answeredState) {
    setAnsweredState(state)
    setCode("")
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <input type="hidden" name="method" value={method} />
      {state.formError ? (
        <Alert variant="destructive">
          <AlertDescription>{state.formError}</AlertDescription>
        </Alert>
      ) : null}
      <p className="text-center text-sm text-muted-foreground">
        {method === "totp" ? t("description") : t("backupDescription")}
      </p>
      <FieldGroup>
        {method === "totp" ? (
          <Field className="items-center">
            <FieldLabel htmlFor="two-factor-code" className="sr-only">
              {t("code")}
            </FieldLabel>
            <OneTimeCodeInput
              id="two-factor-code"
              name="code"
              value={code}
              onChange={setCode}
              onComplete={() => formRef.current?.requestSubmit()}
              autoFocus
            />
          </Field>
        ) : (
          <Field>
            <FieldLabel htmlFor="two-factor-backup-code">
              {t("backupCode")}
            </FieldLabel>
            <Input
              id="two-factor-backup-code"
              name="code"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              autoFocus
              required
            />
          </Field>
        )}
        <Field orientation="horizontal">
          <Checkbox id="two-factor-trust" name="trustDevice" />
          <FieldLabel htmlFor="two-factor-trust" className="font-normal">
            {t("trustDevice")}
          </FieldLabel>
        </Field>
      </FieldGroup>
      <FormSubmitButton idleText={t("submit")} loadingText={t("submitting")} />
      <Button
        type="button"
        variant="link"
        size="sm"
        className="self-center"
        onClick={() => {
          setMethod(method === "totp" ? "backup" : "totp")
          setCode("")
        }}
      >
        {method === "totp" ? t("useBackup") : t("useApp")}
      </Button>
    </form>
  )
}
