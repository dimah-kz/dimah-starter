"use client"

import { Fragment, useState, useTransition } from "react"
import { MonitorIcon, SmartphoneIcon, TabletIcon } from "lucide-react"
import { revokeOtherSessionsAction } from "@/app/action/dashboard/account/revoke-other-sessions-action"
import { revokeSessionAction } from "@/app/action/dashboard/account/revoke-session-action"
import type {
  AccountSession,
  AccountSessionDeviceKind,
} from "@/app/dashboard/account/lib/get-account-sessions"
import { SettingsCard } from "@/components/settings/settings-card"
import { Badge } from "@repo/ui/components/badge"
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
import { useTranslations } from "next-intl"

const sessionDeviceIcons = {
  mobile: SmartphoneIcon,
  tablet: TabletIcon,
  desktop: MonitorIcon,
  unknown: MonitorIcon,
} as const satisfies Record<AccountSessionDeviceKind, typeof MonitorIcon>

type AccountSessionsCardProps = {
  sessions: AccountSession[]
}

export function AccountSessionsCard({ sessions }: AccountSessionsCardProps) {
  const t = useTranslations("account.sessions")
  // `"others"` while signing out every other device.
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const hasOtherSessions = sessions.some((session) => !session.isCurrent)

  const handleRevoke = (sessionId: string) => {
    setPendingId(sessionId)
    startTransition(async () => {
      const result = await revokeSessionAction(sessionId)
      setPendingId(null)

      if (!result.success) {
        toast.add({ title: result.error ?? t("revokeFailed"), type: "error" })
        return
      }

      toast.add({ title: t("revoked"), type: "success" })
    })
  }

  const handleRevokeOthers = () => {
    setPendingId("others")
    startTransition(async () => {
      const result = await revokeOtherSessionsAction()
      setPendingId(null)

      if (!result.success) {
        toast.add({
          title: result.error ?? t("signOutOthersFailed"),
          type: "error",
        })
        return
      }

      toast.add({ title: t("signedOutOthers"), type: "success" })
    })
  }

  return (
    <SettingsCard
      title={t("title")}
      description={t("description")}
      hint={hasOtherSessions ? t("hint") : t("onlyThisDevice")}
      actions={
        hasOtherSessions ? (
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={handleRevokeOthers}
          >
            {pendingId === "others" && isPending
              ? t("signingOutOthers")
              : t("signOutOthers")}
          </Button>
        ) : null
      }
    >
      {sessions.length ? (
        <ItemGroup className="gap-0 rounded-lg ring-1 ring-foreground/10">
          {sessions.map((session, index) => {
            const Icon = sessionDeviceIcons[session.kind]
            const revoking = pendingId === session.id && isPending

            return (
              <Fragment key={session.id}>
                {index > 0 ? <ItemSeparator className="my-0" /> : null}
                <Item size="sm" role="listitem">
                  <ItemMedia>
                    <IconTile variant="outline" size="sm">
                      <Icon aria-hidden />
                    </IconTile>
                  </ItemMedia>
                  <ItemContent className="min-w-0">
                    <ItemTitle className="text-sm">
                      {session.title}
                      {session.isCurrent ? (
                        <Badge variant="secondary" className="font-normal">
                          {t("currentDevice")}
                        </Badge>
                      ) : null}
                    </ItemTitle>
                    <ItemDescription title={session.signedInTitle}>
                      {session.summary}
                    </ItemDescription>
                  </ItemContent>
                  {session.isCurrent ? null : (
                    <ItemActions>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isPending}
                        onClick={() => handleRevoke(session.id)}
                      >
                        {revoking ? t("revoking") : t("revoke")}
                      </Button>
                    </ItemActions>
                  )}
                </Item>
              </Fragment>
            )
          })}
        </ItemGroup>
      ) : (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      )}
    </SettingsCard>
  )
}
