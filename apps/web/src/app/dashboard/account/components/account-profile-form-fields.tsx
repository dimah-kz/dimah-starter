"use client"

import { AccountAvatarField } from "@/app/dashboard/account/components/account-avatar-field"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field"
import { NAME_MAX_LENGTH } from "@/components/form/form-parse"
import { Input } from "@repo/ui/components/input"
import { useTranslations } from "next-intl"

type AccountProfileFormFieldsProps = {
  formId: string
  profile: {
    id: string
    name: string
    email: string
    image: string | null
    imageKey: string | null
  }
}

export function AccountProfileFormFields({
  formId,
  profile,
}: AccountProfileFormFieldsProps) {
  const t = useTranslations("account.profile")

  return (
    <FieldGroup>
      <Field>
        <AccountAvatarField
          image={profile.image}
          objectKey={profile.imageKey}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${formId}-email`}>{t("email")}</FieldLabel>
        <Input
          id={`${formId}-email`}
          type="email"
          value={profile.email}
          disabled
          readOnly
        />
        <FieldDescription>{t("emailHint")}</FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor={`${formId}-name`}>{t("displayName")}</FieldLabel>
        <Input
          id={`${formId}-name`}
          name="name"
          autoComplete="name"
          defaultValue={profile.name}
          maxLength={NAME_MAX_LENGTH}
          required
        />
      </Field>
    </FieldGroup>
  )
}
