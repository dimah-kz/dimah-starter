"use client"

import { removeOrganizationLogoAction } from "@/app/action/dashboard/(organization)/manage/remove-organization-logo-action"
import { setOrganizationLogoAction } from "@/app/action/dashboard/(organization)/manage/set-organization-logo-action"
import { AvatarUploadField } from "@/components/form/avatar-upload-field"
import { useTranslations } from "next-intl"

type OrganizationLogoFieldProps = {
  organizationId: string
  image: string | null
  objectKey: string | null
}

export function OrganizationLogoField({
  organizationId,
  image,
  objectKey,
}: OrganizationLogoFieldProps) {
  const t = useTranslations("dashboard.organizationManage.avatar")

  return (
    <div className="flex justify-center">
      <AvatarUploadField
        route="logo"
        shape="square"
        image={image}
        objectKey={objectKey}
        setAction={(key) => setOrganizationLogoAction(organizationId, key)}
        removeAction={() => removeOrganizationLogoAction(organizationId)}
        labels={{
          upload: t("upload"),
          remove: t("remove"),
          updated: t("updated"),
          removed: t("removed"),
        }}
      />
    </div>
  )
}
