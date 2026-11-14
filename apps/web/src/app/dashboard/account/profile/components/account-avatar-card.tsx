"use client"

import { removeAccountAvatarAction } from "@/app/action/dashboard/account/remove-account-avatar-action"
import { setAccountAvatarAction } from "@/app/action/dashboard/account/set-account-avatar-action"
import { AvatarUploadField } from "@/components/form/avatar-upload-field"
import { SettingsCard } from "@/components/settings/settings-card"
import { useTranslations } from "next-intl"

type AccountAvatarCardProps = {
  image: string | null
  imageKey: string | null
}

export function AccountAvatarCard({ image, imageKey }: AccountAvatarCardProps) {
  const t = useTranslations("account.profile.avatar")

  return (
    <SettingsCard
      title={t("title")}
      description={t("description")}
      hint={t("hint")}
      aside={
        <AvatarUploadField
          route="avatar"
          image={image}
          objectKey={imageKey}
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
      }
    />
  )
}
