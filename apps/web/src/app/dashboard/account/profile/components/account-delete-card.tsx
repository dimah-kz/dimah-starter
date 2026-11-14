"use client"

import { useState, useTransition } from "react"
import { TriangleAlertIcon } from "lucide-react"
import { requestAccountDeletionAction } from "@/app/action/dashboard/account/request-account-deletion-action"
import { SettingsCard } from "@/components/settings/settings-card"
import { Alert, AlertDescription, AlertTitle } from "@repo/ui/components/alert"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/alert-dialog"
import { Button } from "@repo/ui/components/button"
import { toast } from "@repo/ui/components/toast"
import { useFormatter, useTranslations } from "next-intl"

type AccountDeleteCardProps = {
  email: string
  /** Organizations that would be left without an owner. */
  soleOwnedOrganizations: string[]
}

export function AccountDeleteCard({
  email,
  soleOwnedOrganizations,
}: AccountDeleteCardProps) {
  const t = useTranslations("account.delete")
  const tCommon = useTranslations("common")
  const format = useFormatter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const blocked = soleOwnedOrganizations.length > 0

  const handleSend = () => {
    startTransition(async () => {
      const result = await requestAccountDeletionAction()

      if (!result.success) {
        toast.add({ title: result.error ?? t("sendFailed"), type: "error" })
        return
      }

      toast.add({ title: t("sent", { email }), type: "success" })
      setOpen(false)
    })
  }

  return (
    <>
      <SettingsCard
        tone="destructive"
        title={t("title")}
        description={t("description")}
        hint={t("hint")}
        actions={
          <Button
            type="button"
            variant="destructive"
            disabled={blocked}
            onClick={() => setOpen(true)}
          >
            {t("action")}
          </Button>
        }
      >
        {blocked ? (
          <Alert>
            <TriangleAlertIcon aria-hidden />
            <AlertTitle>{t("blockedTitle")}</AlertTitle>
            <AlertDescription>
              {t("blocked", {
                organizations: format.list(soleOwnedOrganizations, {
                  type: "conjunction",
                }),
              })}
            </AlertDescription>
          </Alert>
        ) : null}
      </SettingsCard>

      <AlertDialog
        open={open}
        onOpenChange={(nextOpen) => {
          if (!nextOpen && !isPending) {
            setOpen(false)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("dialogTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("dialogDescription", { email })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              {tCommon("cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isPending}
              onClick={handleSend}
            >
              {isPending ? t("sending") : t("send")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
