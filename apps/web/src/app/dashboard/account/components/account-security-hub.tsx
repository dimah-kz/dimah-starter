"use client"

import Link from "next/link"
import { useState } from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { AccountSettingsPanel } from "@/app/dashboard/account/components/account-settings-panel"
import type { AccountSecurityPanel } from "@/app/dashboard/account/lib/account-panel"
import type { AccountSession } from "@/app/dashboard/account/lib/get-account-sessions"
import { accountSecurityItems } from "@/app/dashboard/account/lib/account-settings-items"
import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"
import { Button } from "@repo/ui/components/button"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@repo/ui/components/item"
import { IconTile } from "@repo/ui/components/reui/icon-tile"
import { useTranslations } from "next-intl"

type AccountSecurityHubProps = {
  hasPasswordCredential: boolean
  sessions: AccountSession[]
}

export function AccountSecurityHub({
  hasPasswordCredential,
  sessions,
}: AccountSecurityHubProps) {
  const t = useTranslations("dashboard")
  const [openSection, setOpenSection] = useState<AccountSecurityPanel | null>(
    null
  )

  return (
    <>
      <div className="flex w-full max-w-xl flex-col gap-4">
        <div className="flex flex-col gap-3">
          <div>
            <Button
              variant="ghost"
              size="sm"
              nativeButton={false}
              render={<Link href={dashboardRoutes.account()} />}
            >
              <ChevronLeftIcon
                data-icon="inline-start"
                className="rtl:rotate-180"
              />
              {t("accountSettings.back")}
            </Button>
          </div>
          <h1 className="text-base font-medium tracking-tight">
            {t("accountSettings.security")}
          </h1>
        </div>

        <div className="flex flex-col gap-2">
          {accountSecurityItems.map((item) => {
            const Icon = item.icon
            return (
              <Item
                key={item.key}
                variant="outline"
                className="hover:bg-muted/50"
                render={
                  <button
                    type="button"
                    className="flex w-full min-w-0 items-center gap-2.5 text-start"
                    onClick={() => setOpenSection(item.key)}
                  />
                }
              >
                <ItemMedia>
                  <IconTile variant="outline" size="sm">
                    <Icon aria-hidden />
                  </IconTile>
                </ItemMedia>
                <ItemContent className="min-w-0">
                  <ItemTitle className="text-sm">{t(item.labelKey)}</ItemTitle>
                  <ItemDescription>{t(item.descriptionKey)}</ItemDescription>
                </ItemContent>
                <ItemActions className="shrink-0 text-muted-foreground">
                  <ChevronRightIcon
                    className="size-4 rtl:rotate-180"
                    aria-hidden
                  />
                </ItemActions>
              </Item>
            )
          })}
        </div>
      </div>

      <AccountSettingsPanel
        section={openSection}
        onClose={() => setOpenSection(null)}
        hasPasswordCredential={hasPasswordCredential}
        sessions={sessions}
      />
    </>
  )
}
