"use client"

import { useActionState } from "react"
import { MailIcon, UserIcon } from "lucide-react"
import { signUpWithEmailAction } from "@/app/action/auth/sign-up-with-email-action"
import { GoogleSignIn } from "@/app/(auth)/components/google-sign-in"
import { AUTH_FORM_INITIAL_STATE } from "@/app/(auth)/lib/auth-form-state"
import { authRoutes } from "@/app/(auth)/lib/auth-routes"
import { Field, FieldGroup, FieldLabel } from "@repo/ui/components/field"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@repo/ui/components/input-group"
import { Alert, AlertDescription } from "@repo/ui/components/alert"
import { FormSubmitButton } from "@/components/form/form-submit-button"
import { PasswordInput } from "@/components/form/password-input"
import { passwordLimits } from "@repo/auth/password-limits"
import { useTranslations } from "next-intl"

type SignUpFormProps = {
  redirectTo: string
  lastLoginMethod?: string | null
  oauthError?: string | null
}

export function SignUpForm({
  redirectTo,
  lastLoginMethod = null,
  oauthError = null,
}: SignUpFormProps) {
  const t = useTranslations("auth.signup")
  const [state, formAction] = useActionState(
    signUpWithEmailAction,
    AUTH_FORM_INITIAL_STATE
  )

  return (
    <div className="flex flex-col gap-4">
      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        {state.formError ? (
          <Alert variant="destructive">
            <AlertDescription>{state.formError}</AlertDescription>
          </Alert>
        ) : null}
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="name">{t("name")}</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="name"
                name="name"
                placeholder={t("namePlaceholder")}
                autoComplete="name"
                required
              />
              <InputGroupAddon>
                <UserIcon
                  className="size-3.5 shrink-0 opacity-60"
                  aria-hidden="true"
                />
              </InputGroupAddon>
            </InputGroup>
          </Field>
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
        </FieldGroup>
        <FormSubmitButton
          idleText={t("submit")}
          loadingText={t("submitting")}
        />
      </form>
      <GoogleSignIn
        redirectTo={redirectTo}
        returnPath={authRoutes.signup()}
        lastLoginMethod={lastLoginMethod}
        oauthError={oauthError}
      />
    </div>
  )
}
