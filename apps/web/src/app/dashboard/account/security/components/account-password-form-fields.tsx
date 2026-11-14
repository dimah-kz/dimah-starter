"use client"

import { PasswordInput } from "@/components/form/password-input"
import { passwordLimits } from "@repo/auth/password-limits"
import { Field, FieldGroup, FieldLabel } from "@repo/ui/components/field"
import { useTranslations } from "next-intl"

type AccountPasswordFormFieldsProps = {
  formId: string
  /** `set` adds a first password, so there is no current one to ask for. */
  mode: "change" | "set"
}

export function AccountPasswordFormFields({
  formId,
  mode,
}: AccountPasswordFormFieldsProps) {
  const t = useTranslations("account.password")

  return (
    <FieldGroup>
      {mode === "change" ? (
        <Field>
          <FieldLabel htmlFor={`${formId}-currentPassword`}>
            {t("current")}
          </FieldLabel>
          <PasswordInput
            id={`${formId}-currentPassword`}
            name="currentPassword"
            autoComplete="current-password"
            required
          />
        </Field>
      ) : null}
      <Field>
        <FieldLabel htmlFor={`${formId}-newPassword`}>{t("new")}</FieldLabel>
        <PasswordInput
          id={`${formId}-newPassword`}
          name="newPassword"
          autoComplete="new-password"
          minLength={passwordLimits.minLength}
          maxLength={passwordLimits.maxLength}
          required
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${formId}-confirmPassword`}>
          {t("confirm")}
        </FieldLabel>
        <PasswordInput
          id={`${formId}-confirmPassword`}
          name="confirmPassword"
          autoComplete="new-password"
          minLength={passwordLimits.minLength}
          maxLength={passwordLimits.maxLength}
          required
        />
      </Field>
    </FieldGroup>
  )
}
