"use client"

import Link from "next/link"
import { useActionState } from "react"
import {
  Building2Icon,
  LogOutIcon,
  TriangleAlertIcon,
  UserRoundXIcon,
} from "lucide-react"
import { deleteAccountAction } from "@/app/action/dashboard/account/delete-account-action"
import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"
import { FormSubmitButton } from "@/components/form/form-submit-button"
import { SettingsCard } from "@/components/settings/settings-card"
import { Alert, AlertDescription } from "@repo/ui/components/alert"
import { Button } from "@repo/ui/components/button"
import { useTranslations } from "next-intl"

const consequences = [
  { key: "consequenceProfile", icon: UserRoundXIcon },
  { key: "consequenceSessions", icon: LogOutIcon },
  { key: "consequenceMemberships", icon: Building2Icon },
] as const

type AccountDeleteConfirmProps = {
  email: string
  token: string
}

export function AccountDeleteConfirm({
  email,
  token,
}: AccountDeleteConfirmProps) {
  const t = useTranslations("account.delete")
  const [state, formAction] = useActionState(
    async (_previous: { error?: string } | null, formData: FormData) => {
      const result = await deleteAccountAction(formData)
      return { error: result.error ?? t("failed") }
    },
    null
  )

  return (
    <form action={formAction}>
      <input type="hidden" name="token" value={token} />
      <SettingsCard
        tone="destructive"
        title={t("confirmTitle")}
        description={t("confirmDescription", { email })}
        actions={
          <>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href={dashboardRoutes.accountProfile()} />}
            >
              {t("keep")}
            </Button>
            {token ? (
              <FormSubmitButton
                variant="destructive"
                className="w-auto"
                idleText={t("confirm")}
                loadingText={t("deleting")}
              />
            ) : null}
          </>
        }
      >
        <div className="flex flex-col gap-4">
          {!token || state?.error ? (
            <Alert variant="destructive">
              <TriangleAlertIcon aria-hidden />
              <AlertDescription>
                {token ? state?.error : t("missingToken")}
              </AlertDescription>
            </Alert>
          ) : null}
          <ul className="flex flex-col gap-2.5 text-sm">
            {consequences.map(({ key, icon: Icon }) => (
              <li key={key} className="flex items-center gap-2.5">
                <Icon
                  className="size-4 shrink-0 text-muted-foreground"
                  aria-hidden
                />
                {t(key)}
              </li>
            ))}
          </ul>
        </div>
      </SettingsCard>
    </form>
  )
}
