"use client"

import { useId, useState, useTransition } from "react"
import { CircleCheckIcon, CircleDashedIcon } from "lucide-react"
import { changePasswordAction } from "@/app/action/dashboard/account/change-password-action"
import { setPasswordAction } from "@/app/action/dashboard/account/set-password-action"
import { AccountPasswordFormFields } from "@/app/dashboard/account/security/components/account-password-form-fields"
import { LabeledBadge } from "@/components/badge/labeled-badge"
import { ResponsiveFormOverlay } from "@/components/form/responsive-form-overlay"
import { SettingsCard } from "@/components/settings/settings-card"
import { Button } from "@repo/ui/components/button"
import { toast } from "@repo/ui/components/toast"
import { useTranslations } from "next-intl"

type AccountPasswordCardProps = {
  email: string
  hasPassword: boolean
}

export function AccountPasswordCard({
  email,
  hasPassword,
}: AccountPasswordCardProps) {
  const t = useTranslations("account.password")
  const tCommon = useTranslations("common")
  const formId = useId()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const mode = hasPassword ? "change" : "set"

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const result = hasPassword
        ? await changePasswordAction(formData)
        : await setPasswordAction(formData)
      const failed = hasPassword ? t("saveFailed") : t("addFailed")

      if (!result.success) {
        toast.add({ title: result.error ?? failed, type: "error" })
        return
      }

      toast.add({
        title: hasPassword ? t("saved") : t("added"),
        type: "success",
      })
      setOpen(false)
    })
  }

  return (
    <>
      <SettingsCard
        title={t("title")}
        description={t("description")}
        badge={
          hasPassword ? (
            <LabeledBadge
              variant="success-light"
              icon={<CircleCheckIcon aria-hidden />}
              label={t("statusSet")}
            />
          ) : (
            <LabeledBadge
              variant="outline"
              icon={<CircleDashedIcon aria-hidden />}
              label={t("statusNotSet")}
            />
          )
        }
        hint={hasPassword ? t("changeHint") : t("setHint")}
        actions={
          <Button
            type="button"
            variant={hasPassword ? "outline" : "default"}
            onClick={() => setOpen(true)}
          >
            {hasPassword ? t("change") : t("set")}
          </Button>
        }
      />

      <ResponsiveFormOverlay
        open={open}
        onOpenChange={(nextOpen) => {
          // Stay open while saving, so the result toast has its form behind it.
          if (!nextOpen && !isPending) {
            setOpen(false)
          }
        }}
        title={hasPassword ? t("change") : t("set")}
        description={
          hasPassword ? t("changeDescription") : t("setDescription", { email })
        }
        footer={
          <>
            <Button type="submit" form={formId} disabled={isPending}>
              {isPending ? t("saving") : hasPassword ? t("save") : t("set")}
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setOpen(false)}
            >
              {tCommon("cancel")}
            </Button>
          </>
        }
      >
        <form
          id={formId}
          noValidate
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            handleSubmit(new FormData(event.currentTarget))
          }}
        >
          <AccountPasswordFormFields formId={formId} mode={mode} />
        </form>
      </ResponsiveFormOverlay>
    </>
  )
}
