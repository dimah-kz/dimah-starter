"use client"

import { useActionState } from "react"
import { MailIcon } from "lucide-react"
import { requestPasswordResetAction } from "@/app/action/auth/request-password-reset-action"
import { AUTH_FORM_INITIAL_STATE } from "@/app/(auth)/lib/auth-form-state"
import { Alert, AlertDescription } from "@repo/ui/components/alert"
import { Field, FieldGroup, FieldLabel } from "@repo/ui/components/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@repo/ui/components/input-group"
import { FormSubmitButton } from "@/components/form/form-submit-button"
import { useTranslations } from "next-intl"

type ForgotPasswordFormProps = {
  redirectTo: string
}

export function ForgotPasswordForm({ redirectTo }: ForgotPasswordFormProps) {
  const t = useTranslations("auth.forgotPassword")
  const [state, formAction] = useActionState(
    requestPasswordResetAction,
    AUTH_FORM_INITIAL_STATE
  )

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirectTo" value={redirectTo} />
      <p className="text-center text-sm text-muted-foreground">
        {t("description")}
      </p>
      {state.formError ? (
        <Alert variant="destructive">
          <AlertDescription>{state.formError}</AlertDescription>
        </Alert>
      ) : null}
      {state.formMessage ? (
        <Alert>
          <AlertDescription>{state.formMessage}</AlertDescription>
        </Alert>
      ) : null}
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">{t("email")}</FieldLabel>
          <InputGroup>
            <InputGroupInput
              id="email"
              name="email"
              type="email"
              placeholder={t("emailPlaceholder")}
              autoComplete="email"
              required
            />
            <InputGroupAddon>
              <MailIcon
                className="size-3.5 shrink-0 opacity-60"
                aria-hidden="true"
              />
            </InputGroupAddon>
          </InputGroup>
        </Field>
      </FieldGroup>
      <FormSubmitButton idleText={t("submit")} loadingText={t("submitting")} />
    </form>
  )
}
