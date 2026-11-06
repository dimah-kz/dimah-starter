"use client"

import { removeOrganizationLogoAction } from "@/app/action/dashboard/(organization)/manage/settings/remove-organization-logo-action"
import { setOrganizationLogoAction } from "@/app/action/dashboard/(organization)/manage/settings/set-organization-logo-action"
import { AvatarUploadField } from "@/components/form/avatar-upload-field"
import { useTranslations } from "next-intl"

type OrganizationLogoFieldProps = {
  image: string | null
  objectKey: string | null
}

/** Logo of the active organization. */
export function OrganizationLogoField({
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
        setAction={setOrganizationLogoAction}
        removeAction={removeOrganizationLogoAction}
        labels={{
          upload: t("upload"),
          remove: t("remove"),
          updated: t("updated"),
          removed: t("removed"),
          uploadFailed: t("uploadFailed"),
          removeFailed: t("removeFailed"),
        }}
      />
    </div>
  )
}
