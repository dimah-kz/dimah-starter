"use client"

import { useActionState } from "react"
import { resetPasswordAction } from "@/app/action/auth/reset-password-action"
import { AUTH_FORM_INITIAL_STATE } from "@/app/(auth)/lib/auth-form-state"
import { Alert, AlertDescription } from "@repo/ui/components/alert"
import { Field, FieldGroup, FieldLabel } from "@repo/ui/components/field"
import { FormSubmitButton } from "@/components/form/form-submit-button"
import { PasswordInput } from "@/components/form/password-input"
import { passwordLimits } from "@repo/auth/password-limits"
import { useTranslations } from "next-intl"

type ResetPasswordFormProps = {
  token: string
  redirectTo: string
}

export function ResetPasswordForm({
  token,
  redirectTo,
}: ResetPasswordFormProps) {
  const t = useTranslations("auth.resetPassword")
  const [state, formAction] = useActionState(
    resetPasswordAction,
    AUTH_FORM_INITIAL_STATE
  )

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="redirectTo" value={redirectTo} />
      {state.formError ? (
        <Alert variant="destructive">
          <AlertDescription>{state.formError}</AlertDescription>
        </Alert>
      ) : null}
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
          <PasswordInput
            id="password"
            name="password"
            autoComplete="new-password"
            minLength={passwordLimits.minLength}
            maxLength={passwordLimits.maxLength}
            required
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="confirmPassword">{t("confirm")}</FieldLabel>
          <PasswordInput
            id="confirmPassword"
            name="confirmPassword"
            autoComplete="new-password"
            minLength={passwordLimits.minLength}
            maxLength={passwordLimits.maxLength}
            required
          />
        </Field>
      </FieldGroup>
      <FormSubmitButton idleText={t("submit")} loadingText={t("submitting")} />
    </form>
  )
}
