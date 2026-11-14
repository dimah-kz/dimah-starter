"use client"

import { useId, useState, useTransition } from "react"
import { disableTwoFactorAction } from "@/app/action/dashboard/account/disable-two-factor-action"
import { generateBackupCodesAction } from "@/app/action/dashboard/account/generate-backup-codes-action"
import { BackupCodesList } from "@/app/dashboard/account/security/components/backup-codes-list"
import { PasswordInput } from "@/components/form/password-input"
import { useCloseOnHide } from "@/lib/use-close-on-hide"
import { Button } from "@repo/ui/components/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog"
import { Field, FieldLabel } from "@repo/ui/components/field"
import { toast } from "@repo/ui/components/toast"
import { useTranslations } from "next-intl"

export type TwoFactorPasswordAction = "disable" | "regenerate"

type TwoFactorPasswordDialogProps = {
  action: TwoFactorPasswordAction | null
  onClose: () => void
}

/** Turning two-factor off and replacing backup codes both re-check the password. */
export function TwoFactorPasswordDialog({
  action,
  onClose,
}: TwoFactorPasswordDialogProps) {
  const t = useTranslations("account.twoFactor")
  const tCommon = useTranslations("common")
  const formId = useId()
  const [password, setPassword] = useState("")
  const [codes, setCodes] = useState<string[] | null>(null)
  const [isPending, startTransition] = useTransition()
  const open = action !== null

  // Start over on each opening, and keep showing the last action while the
  // dialog fades out after `action` turns `null`.
  const [shownAction, setShownAction] = useState(action)
  if (action !== null && action !== shownAction) {
    setShownAction(action)
  }
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setPassword("")
      setCodes(null)
    }
  }

  const close = onClose

  useCloseOnHide(open, close)

  const submit = () => {
    startTransition(async () => {
      if (shownAction === "disable") {
        const result = await disableTwoFactorAction(password)

        if (!result.success) {
          toast.add({
            title: result.error ?? t("disableDialog.failed"),
            type: "error",
          })
          return
        }

        toast.add({ title: t("disableDialog.disabled"), type: "success" })
        close()
        return
      }

      const result = await generateBackupCodesAction(password)

      if (!result.success) {
        toast.add({ title: result.error ?? t("codes.failed"), type: "error" })
        return
      }

      setPassword("")
      setCodes(result.backupCodes)
    })
  }

  const title =
    shownAction === "disable" ? t("disableDialog.title") : t("codes.title")
  const description = codes
    ? t("codes.generated")
    : shownAction === "disable"
      ? t("disableDialog.description")
      : t("codes.description")

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isPending) {
          close()
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {codes ? (
          <BackupCodesList codes={codes} />
        ) : (
          <form
            id={formId}
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              submit()
            }}
          >
            <Field>
              <FieldLabel htmlFor={`${formId}-password`}>
                {t("password")}
              </FieldLabel>
              <PasswordInput
                id={`${formId}-password`}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoFocus
                required
              />
            </Field>
          </form>
        )}

        <DialogFooter>
          {codes ? (
            <Button type="button" onClick={close}>
              {t("setup.done")}
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={close}
              >
                {tCommon("cancel")}
              </Button>
              <Button
                type="submit"
                form={formId}
                variant={shownAction === "disable" ? "destructive" : "default"}
                disabled={isPending || !password}
              >
                {shownAction === "disable"
                  ? isPending
                    ? t("disableDialog.disabling")
                    : t("disableDialog.confirm")
                  : isPending
                    ? t("checking")
                    : t("continue")}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
