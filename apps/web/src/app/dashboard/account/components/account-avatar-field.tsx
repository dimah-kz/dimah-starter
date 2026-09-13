"use client"

import { removeAccountAvatarAction } from "@/app/action/dashboard/account/remove-account-avatar-action"
import { setAccountAvatarAction } from "@/app/action/dashboard/account/set-account-avatar-action"
import { AvatarUploadField } from "@/components/form/avatar-upload-field"
import { useTranslations } from "next-intl"

type AccountAvatarFieldProps = {
  name: string
  image: string | null
}

export function AccountAvatarField({ name, image }: AccountAvatarFieldProps) {
  const t = useTranslations("account.profile.avatar")

  return (
    <div className="flex justify-center">
      <AvatarUploadField
        ownerKind="user"
        name={name}
        image={image}
        setAction={setAccountAvatarAction}
        removeAction={removeAccountAvatarAction}
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
