"use client"

import { PasswordInput } from "@/components/form/password-input"
import { passwordLimits } from "@repo/auth/password-limits"
import { Field, FieldGroup, FieldLabel } from "@repo/ui/components/field"
import { useTranslations } from "next-intl"

type AccountPasswordFormFieldsProps = {
  formId: string
}

export function AccountPasswordFormFields({
  formId,
}: AccountPasswordFormFieldsProps) {
  const t = useTranslations("account.password")

  return (
    <FieldGroup>
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
