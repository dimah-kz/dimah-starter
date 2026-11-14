"use client"

import { removeAccountAvatarAction } from "@/app/action/dashboard/account/remove-account-avatar-action"
import { setAccountAvatarAction } from "@/app/action/dashboard/account/set-account-avatar-action"
import { AvatarUploadField } from "@/components/form/avatar-upload-field"
import { useTranslations } from "next-intl"

type AccountAvatarFieldProps = {
  image: string | null
  objectKey: string | null
}

export function AccountAvatarField({
  image,
  objectKey,
}: AccountAvatarFieldProps) {
  const t = useTranslations("account.profile.avatar")

  return (
    <div className="flex justify-center">
      <AvatarUploadField
        route="avatar"
        image={image}
        objectKey={objectKey}
        setAction={setAccountAvatarAction}
        removeAction={removeAccountAvatarAction}
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
