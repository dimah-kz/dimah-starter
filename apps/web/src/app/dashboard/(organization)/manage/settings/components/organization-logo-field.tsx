"use client"

import { removeOrganizationLogoAction } from "@/app/action/dashboard/(organization)/manage/remove-organization-logo-action"
import { setOrganizationLogoAction } from "@/app/action/dashboard/(organization)/manage/set-organization-logo-action"
import { AvatarUploadField } from "@/components/avatar-upload-field"
import { useTranslations } from "next-intl"

type OrganizationLogoFieldProps = {
  organizationId: string
  name: string
  logo: string | null
}

export function OrganizationLogoField({
  organizationId,
  name,
  logo,
}: OrganizationLogoFieldProps) {
  const t = useTranslations("dashboard.organizationManage.avatar")

  return (
    <div className="flex justify-center">
      <AvatarUploadField
        ownerKind="org"
        name={name}
        image={logo}
        setAction={(key) => setOrganizationLogoAction(organizationId, key)}
        removeAction={() => removeOrganizationLogoAction(organizationId)}
        labels={{
          upload: t("upload"),
          remove: t("remove"),
          updated: t("updated"),
          removed: t("removed"),
          uploadFailed: t("uploadFailed"),
        }}
      />
    </div>
  )
}
