"use client"

import { useId, useState, useTransition } from "react"
import { BadgeCheckIcon } from "lucide-react"
import { changeEmailAction } from "@/app/action/dashboard/account/change-email-action"
import { LabeledBadge } from "@/components/badge/labeled-badge"
import { SettingsCard } from "@/components/settings/settings-card"
import { Button } from "@repo/ui/components/button"
import { Field, FieldLabel } from "@repo/ui/components/field"
import { Input } from "@repo/ui/components/input"
import { toast } from "@repo/ui/components/toast"
import { useTranslations } from "next-intl"

type AccountEmailCardProps = {
  email: string
  emailVerified: boolean
}

export function AccountEmailCard({
  email,
  emailVerified,
}: AccountEmailCardProps) {
  const t = useTranslations("account.profile.email")
  const inputId = useId()
  const [value, setValue] = useState(email)
  const [isPending, startTransition] = useTransition()
  const unchanged =
    value.trim().toLowerCase() === email.toLowerCase() || !value.trim()

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)

        startTransition(async () => {
          const result = await changeEmailAction(formData)

          if (!result.success) {
            toast.add({ title: result.error ?? t("saveFailed"), type: "error" })
            return
          }

          // The address changes only after both links are opened.
          setValue(email)
          toast.add({ title: t("sent", { email }), type: "success" })
        })
      }}
    >
      <SettingsCard
        title={t("title")}
        description={t("description")}
        badge={
          emailVerified ? (
            <LabeledBadge
              variant="success-light"
              icon={<BadgeCheckIcon aria-hidden />}
              label={t("verified")}
            />
          ) : null
        }
        hint={t("hint")}
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
            name="email"
            type="email"
            autoComplete="email"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            required
          />
        </Field>
      </SettingsCard>
    </form>
  )
}
