"use client"

import { useId, useState, useTransition } from "react"
import { createOrganizationAction } from "@/app/action/dashboard/create-organization-action"
import { FormLabel } from "@/components/form/form-label"
import { ResponsiveFormOverlay } from "@/components/form/responsive-form-overlay"
import { Button } from "@repo/ui/components/button"
import { Input } from "@repo/ui/components/input"
import { toast } from "@repo/ui/components/toast"
import { useTranslations } from "next-intl"

type CreateOrganizationFormShellProps = {
  open: boolean
  onClose: () => void
}

export function CreateOrganizationFormShell({
  open,
  onClose,
}: CreateOrganizationFormShellProps) {
  const t = useTranslations("dashboard.nav.organizationSwitcher")
  const tCommon = useTranslations("common")
  const formId = useId()
  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState("")

  const canSubmit = Boolean(name.trim())

  const close = () => {
    setName("")
    onClose()
  }

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await createOrganizationAction({ name })

      if (!result.success) {
        toast.add({
          title: result.error ?? t("organizationCreateFailed"),
          type: "error",
        })
        return
      }

      toast.add({ title: t("organizationCreated"), type: "success" })
      close()
    })
  }

  const createOrganizationLabel = t("createOrganization")

  return (
    <ResponsiveFormOverlay
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          close()
        }
      }}
      title={createOrganizationLabel}
      footer={
        <>
          <Button
            type="submit"
            form={formId}
            disabled={isPending || !canSubmit}
          >
            {createOrganizationLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={close}
          >
            {tCommon("cancel")}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault()
          if (canSubmit) {
            handleSubmit()
          }
        }}
      >
        <FormLabel htmlFor={`${formId}-name`} required>
          {t("nameLabel")}
        </FormLabel>
        <Input
          id={`${formId}-name`}
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="organization"
          disabled={isPending}
          required
        />
      </form>
    </ResponsiveFormOverlay>
  )
}
