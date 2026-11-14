"use client"

import { useState } from "react"
import {
  KeyRoundIcon,
  ShieldCheckIcon,
  ShieldOffIcon,
  SmartphoneIcon,
} from "lucide-react"
import {
  TwoFactorPasswordDialog,
  type TwoFactorPasswordAction,
} from "@/app/dashboard/account/security/components/two-factor-password-dialog"
import { TwoFactorSetupDialog } from "@/app/dashboard/account/security/components/two-factor-setup-dialog"
import { LabeledBadge } from "@/components/badge/labeled-badge"
import { SettingsCard } from "@/components/settings/settings-card"
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

type AccountTwoFactorCardProps = {
  enabled: boolean
  hasPassword: boolean
}

export function AccountTwoFactorCard({
  enabled,
  hasPassword,
}: AccountTwoFactorCardProps) {
  const t = useTranslations("account.twoFactor")
  const [setupOpen, setSetupOpen] = useState(false)
  const [passwordAction, setPasswordAction] =
    useState<TwoFactorPasswordAction | null>(null)

  return (
    <>
      <SettingsCard
        title={t("title")}
        description={t("description")}
        badge={
          enabled ? (
            <LabeledBadge
              variant="success-light"
              icon={<ShieldCheckIcon aria-hidden />}
              label={t("statusOn")}
            />
          ) : (
            <LabeledBadge
              variant="outline"
              icon={<ShieldOffIcon aria-hidden />}
              label={t("statusOff")}
            />
          )
        }
        hint={
          !hasPassword
            ? t("needsPassword")
            : enabled
              ? t("onHint")
              : t("offHint")
        }
        actions={
          enabled ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setPasswordAction("disable")}
            >
              {t("disable")}
            </Button>
          ) : (
            <Button
              type="button"
              disabled={!hasPassword}
              onClick={() => setSetupOpen(true)}
            >
              {t("enable")}
            </Button>
          )
        }
      >
        {enabled ? (
          <ItemGroup className="gap-0 rounded-lg ring-1 ring-foreground/10">
            <Item size="sm">
              <ItemMedia>
                <IconTile variant="outline" size="sm">
                  <SmartphoneIcon aria-hidden />
                </IconTile>
              </ItemMedia>
              <ItemContent className="min-w-0">
                <ItemTitle className="text-sm">{t("app")}</ItemTitle>
                <ItemDescription>{t("appDescription")}</ItemDescription>
              </ItemContent>
            </Item>
            <ItemSeparator className="my-0" />
            <Item size="sm">
              <ItemMedia>
                <IconTile variant="outline" size="sm">
                  <KeyRoundIcon aria-hidden />
                </IconTile>
              </ItemMedia>
              <ItemContent className="min-w-0">
                <ItemTitle className="text-sm">{t("backupCodes")}</ItemTitle>
                <ItemDescription>{t("backupCodesDescription")}</ItemDescription>
              </ItemContent>
              <ItemActions>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setPasswordAction("regenerate")}
                >
                  {t("regenerate")}
                </Button>
              </ItemActions>
            </Item>
          </ItemGroup>
        ) : null}
      </SettingsCard>

      <TwoFactorSetupDialog open={setupOpen} onOpenChange={setSetupOpen} />
      <TwoFactorPasswordDialog
        action={passwordAction}
        onClose={() => setPasswordAction(null)}
      />
    </>
  )
}
