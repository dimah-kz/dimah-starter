"use client"

import { useActionState } from "react"
import { MailIcon } from "lucide-react"
import { signInWithEmailAction } from "@/app/action/auth/sign-in-with-email-action"
import { AuthCrossLink } from "@/app/(auth)/components/auth-cross-link"
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
import { Badge } from "@repo/ui/components/badge"
import { FormSubmitButton } from "@/components/form/form-submit-button"
import { PasswordInput } from "@/components/form/password-input"
import { useTranslations } from "next-intl"

type LoginFormProps = {
  redirectTo: string
  lastLoginMethod?: string | null
  passwordReset?: boolean
  oauthError?: string | null
}

export function LoginForm({
  redirectTo,
  lastLoginMethod = null,
  passwordReset = false,
  oauthError = null,
}: LoginFormProps) {
  const t = useTranslations("auth.login")
  const tSocial = useTranslations("auth.social")
  const [state, formAction] = useActionState(
    signInWithEmailAction,
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
        {passwordReset && !state.formError ? (
          <Alert>
            <AlertDescription>{t("passwordReset")}</AlertDescription>
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
          <Field>
            <FieldLabel htmlFor="password">{t("password")}</FieldLabel>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="current-password"
              required
            />
          </Field>
        </FieldGroup>
        <div className="flex justify-end">
          <AuthCrossLink
            className="text-sm font-medium text-primary"
            target={authRoutes.forgotPassword()}
          >
            {t("forgotPassword")}
          </AuthCrossLink>
        </div>
        <div className="relative">
          <FormSubmitButton
            idleText={t("submit")}
            loadingText={t("submitting")}
          />
          {lastLoginMethod === "email" ? (
            <Badge
              variant="secondary"
              className="pointer-events-none absolute end-2 top-0 z-10 -translate-y-1/2"
            >
              {tSocial("lastUsed")}
            </Badge>
          ) : null}
        </div>
      </form>
      <GoogleSignIn
        redirectTo={redirectTo}
        returnPath={authRoutes.login()}
        lastLoginMethod={lastLoginMethod}
        oauthError={oauthError}
      />
    </div>
  )
}
