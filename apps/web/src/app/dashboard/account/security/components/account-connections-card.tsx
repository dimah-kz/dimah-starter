"use client"

import { Fragment, useActionState, useTransition } from "react"
import { TriangleAlertIcon } from "lucide-react"
import { linkSocialAccountAction } from "@/app/action/dashboard/account/link-social-account-action"
import { unlinkAccountAction } from "@/app/action/dashboard/account/unlink-account-action"
import type {
  AccountConnection,
  AccountConnectionProvider,
} from "@/app/dashboard/account/lib/get-account-security"
import { GoogleMark } from "@/components/google-mark"
import { SettingsCard } from "@/components/settings/settings-card"
import { formatDate, resolveLocale } from "@repo/i18n"
import { Alert, AlertDescription } from "@repo/ui/components/alert"
import { Button } from "@repo/ui/components/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@repo/ui/components/item"
import { IconTile } from "@repo/ui/components/reui/icon-tile"
import { toast } from "@repo/ui/components/toast"
import { useLocale, useTranslations } from "next-intl"

const providerMarks = {
  google: GoogleMark,
} as const satisfies Record<AccountConnectionProvider, typeof GoogleMark>

type AccountConnectionsCardProps = {
  connections: AccountConnection[]
  /** Better Auth refuses to unlink the last one. */
  signInMethodCount: number
  /** The OAuth callback came back with an error. */
  callbackFailed: boolean
}

export function AccountConnectionsCard({
  connections,
  signInMethodCount,
  callbackFailed,
}: AccountConnectionsCardProps) {
  const t = useTranslations("account.connections")
  const tSocial = useTranslations("auth.social")
  const locale = resolveLocale(useLocale())
  const [linkState, linkAction, isLinking] = useActionState(
    linkSocialAccountAction,
    {}
  )
  const [isUnlinking, startUnlink] = useTransition()
  const busy = isLinking || isUnlinking
  const onlyMethod = signInMethodCount <= 1
  const providerNames: Record<AccountConnectionProvider, string> = {
    google: tSocial("google"),
  }
  // One provider today; name the first when the callback does not say which.
  const fallbackName = providerNames[connections[0]?.provider ?? "google"]
  const linkError =
    linkState.error ??
    (linkState.failed || callbackFailed
      ? t("connectFailed", { provider: fallbackName })
      : null)

  const handleDisconnect = (accountId: string, provider: string) => {
    startUnlink(async () => {
      const result = await unlinkAccountAction(accountId)

      if (!result.success) {
        toast.add({
          title: result.error ?? t("disconnectFailed", { provider }),
          type: "error",
        })
        return
      }

      toast.add({ title: t("disconnected", { provider }), type: "success" })
    })
  }

  return (
    <SettingsCard
      title={t("title")}
      description={t("description")}
      hint={
        onlyMethod && connections.some(({ accountId }) => accountId)
          ? t("onlyMethod")
          : t("hint")
      }
    >
      <div className="flex flex-col gap-3">
        {linkError ? (
          <Alert variant="destructive">
            <TriangleAlertIcon aria-hidden />
            <AlertDescription>{linkError}</AlertDescription>
          </Alert>
        ) : null}
        <ItemGroup className="gap-0 rounded-lg ring-1 ring-foreground/10">
          {connections.map(({ provider, accountId, connectedAt }, index) => {
            const Mark = providerMarks[provider]
            const name = providerNames[provider]

            return (
              <Fragment key={provider}>
                {index > 0 ? <ItemSeparator className="my-0" /> : null}
                <Item size="sm">
                  <ItemMedia>
                    <IconTile variant="outline" size="sm">
                      <Mark className="size-4" />
                    </IconTile>
                  </ItemMedia>
                  <ItemContent className="min-w-0">
                    <ItemTitle className="text-sm">{name}</ItemTitle>
                    <ItemDescription>
                      {!accountId
                        ? t("notConnected")
                        : connectedAt
                          ? t("connectedSince", {
                              date: formatDate(connectedAt, locale),
                            })
                          : null}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    {accountId ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={busy || onlyMethod}
                        onClick={() => handleDisconnect(accountId, name)}
                      >
                        {t("disconnect")}
                      </Button>
                    ) : (
                      <form action={linkAction}>
                        <input type="hidden" name="provider" value={provider} />
                        <Button
                          type="submit"
                          size="sm"
                          disabled={busy}
                          aria-busy={isLinking}
                        >
                          {t("connect")}
                        </Button>
                      </form>
                    )}
                  </ItemActions>
                </Item>
              </Fragment>
            )
          })}
        </ItemGroup>
      </div>
    </SettingsCard>
  )
}
