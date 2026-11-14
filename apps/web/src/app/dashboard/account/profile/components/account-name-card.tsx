"use client"

import { useId, useState, useTransition } from "react"
import { updateProfileAction } from "@/app/action/dashboard/account/update-profile-action"
import { NAME_MAX_LENGTH } from "@/components/form/form-parse"
import { SettingsCard } from "@/components/settings/settings-card"
import { Button } from "@repo/ui/components/button"
import { Field, FieldLabel } from "@repo/ui/components/field"
import { Input } from "@repo/ui/components/input"
import { toast } from "@repo/ui/components/toast"
import { useTranslations } from "next-intl"

type AccountNameCardProps = {
  name: string
}

export function AccountNameCard({ name }: AccountNameCardProps) {
  const t = useTranslations("account.profile.name")
  const inputId = useId()
  const [value, setValue] = useState(name)
  const [isPending, startTransition] = useTransition()
  const unchanged = value.trim() === name || !value.trim()

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)

        startTransition(async () => {
          const result = await updateProfileAction(formData)

          if (!result.success) {
            toast.add({ title: result.error ?? t("saveFailed"), type: "error" })
            return
          }

          toast.add({ title: t("saved"), type: "success" })
        })
      }}
    >
      <SettingsCard
        title={t("title")}
        description={t("description")}
        hint={t("hint", { max: NAME_MAX_LENGTH })}
        actions={
          <Button type="submit" disabled={unchanged || isPending}>
            {isPending ? t("saving") : t("save")}
          </Button>
        }
      >
        <Field className="max-w-sm">
          <FieldLabel htmlFor={inputId} className="sr-only">
            {t("label")}
          </FieldLabel>
          <Input
            id={inputId}
            name="name"
            autoComplete="name"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            maxLength={NAME_MAX_LENGTH}
            required
          />
        </Field>
      </SettingsCard>
    </form>
  )
}
