"use client"

import { Fragment, useState, useTransition } from "react"
import { MonitorIcon, SmartphoneIcon, TabletIcon } from "lucide-react"
import { revokeSessionAction } from "@/app/action/dashboard/account/revoke-session-action"
import type {
  AccountSession,
  AccountSessionDeviceKind,
} from "@/app/dashboard/account/lib/get-account-sessions"
import { toast } from "@repo/ui/components/toast"
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
import { useTranslations } from "next-intl"

const sessionDeviceIcons = {
  mobile: SmartphoneIcon,
  tablet: TabletIcon,
  desktop: MonitorIcon,
  unknown: MonitorIcon,
} as const satisfies Record<AccountSessionDeviceKind, typeof MonitorIcon>

type AccountSessionsContentProps = {
  sessions: AccountSession[]
  disabled?: boolean
}

export function AccountSessionsContent({
  sessions,
  disabled = false,
}: AccountSessionsContentProps) {
  const t = useTranslations("account.sessions")
  const [pendingSessionId, setPendingSessionId] = useState<string | null>(null)
  const [isRevoking, startRevoke] = useTransition()

  const handleRevoke = (sessionId: string) => {
    setPendingSessionId(sessionId)
    startRevoke(async () => {
      const result = await revokeSessionAction(sessionId)
      setPendingSessionId(null)
      if (!result.success) {
        toast.add({
          title: result.error ?? t("revokeFailed"),
          type: "error",
        })
        return
      }
      toast.add({ title: t("revoked"), type: "success" })
    })
  }

  if (!sessions.length) {
    return <p className="text-sm text-muted-foreground">{t("empty")}</p>
  }

  const onlyCurrentDevice =
    sessions.length === 1 && sessions[0]?.isCurrent === true

  return (
    <div className="flex flex-col gap-3">
      <ItemGroup className="gap-0">
        {sessions.map((session, index) => {
          const isPending = pendingSessionId === session.id && isRevoking
          const Icon = sessionDeviceIcons[session.kind]

          return (
            <Fragment key={session.id}>
              {index > 0 ? <ItemSeparator /> : null}
              <Item role="listitem">
                <ItemMedia>
                  <IconTile variant="outline" size="sm">
                    <Icon aria-hidden />
                  </IconTile>
                </ItemMedia>
                <ItemContent className="min-w-0">
                  <ItemTitle className="text-sm">{session.title}</ItemTitle>
                  <ItemDescription title={session.signedInTitle}>
                    {session.summary}
                  </ItemDescription>
                </ItemContent>
                <ItemActions className="shrink-0">
                  {session.isCurrent ? (
                    <Badge variant="secondary" className="font-normal">
                      {t("currentDevice")}
                    </Badge>
                  ) : (
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      disabled={disabled || isPending}
                      onClick={() => handleRevoke(session.id)}
                    >
                      {isPending ? t("revoking") : t("revoke")}
                    </Button>
                  )}
                </ItemActions>
              </Item>
            </Fragment>
          )
        })}
      </ItemGroup>
      {onlyCurrentDevice ? (
        <p className="text-sm text-muted-foreground">{t("onlyThisDevice")}</p>
      ) : null}
    </div>
  )
}
