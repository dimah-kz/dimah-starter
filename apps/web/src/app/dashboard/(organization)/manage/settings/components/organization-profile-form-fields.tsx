"use client"

import { OrganizationLogoField } from "@/app/dashboard/(organization)/manage/settings/components/organization-logo-field"
import type { OrganizationBranding } from "@/app/dashboard/(organization)/manage/settings/lib/get-active-organization-branding"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@repo/ui/components/field"
import { Input } from "@repo/ui/components/input"
import { useTranslations } from "next-intl"

type OrganizationProfileFormFieldsProps = {
  formId: string
  organization: OrganizationBranding & { logoKey: string | null }
}

export function OrganizationProfileFormFields({
  formId,
  organization,
}: OrganizationProfileFormFieldsProps) {
  const t = useTranslations("dashboard.organizationSettings.profile")

  return (
    <FieldGroup>
      <Field>
        <OrganizationLogoField
          image={organization.logo}
          objectKey={organization.logoKey}
        />
      </Field>
      <Field>
        <FieldLabel htmlFor={`${formId}-slug`}>{t("slugLabel")}</FieldLabel>
        <Input
          id={`${formId}-slug`}
          value={organization.slug}
          disabled
          readOnly
        />
        <FieldDescription>{t("slugHint")}</FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor={`${formId}-name`}>{t("nameLabel")}</FieldLabel>
        <Input
          id={`${formId}-name`}
          name="name"
          autoComplete="organization"
          defaultValue={organization.name}
          required
        />
      </Field>
    </FieldGroup>
  )
}
