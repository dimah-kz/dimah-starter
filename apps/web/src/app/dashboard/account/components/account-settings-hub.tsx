"use client"

import { Fragment, useState } from "react"
import { ChevronRightIcon } from "lucide-react"
import { AccountSettingsPanel } from "@/app/dashboard/account/components/account-settings-panel"
import { useTranslations } from "next-intl"
import { accountHubSections } from "@/app/dashboard/account/lib/account-settings-items"
import type { AccountPanel } from "@/app/dashboard/account/lib/account-panel"
import { SettingsNavItem } from "@/components/settings/settings-nav-item"
import { SettingsSection } from "@/components/settings/settings-section"
import {
  Identity,
  IdentityAvatar,
  IdentityContent,
  IdentityDescription,
  IdentityTitle,
} from "@repo/ui/components/dimah/identity"
import { Item, ItemActions, ItemSeparator } from "@repo/ui/components/item"

type AccountSettingsHubProps = {
  profile: {
    id: string
    name: string
    email: string
    image: string | null
  }
}

export function AccountSettingsHub({ profile }: AccountSettingsHubProps) {
  const t = useTranslations("dashboard")
  const [openSection, setOpenSection] = useState<AccountPanel | null>(null)

  return (
    <>
      <div className="flex w-full max-w-xl flex-col gap-6">
        <SettingsSection label={t("accountSettings.sections.account")}>
          <Item
            className="rounded-none hover:bg-muted/50"
            render={
              <button
                type="button"
                className="flex w-full min-w-0 items-center gap-2.5 text-start"
                onClick={() => setOpenSection("profile")}
              />
            }
          >
            <Identity size="lg" className="w-auto flex-1">
              <IdentityAvatar src={profile.image} name={profile.name} />
              <IdentityContent>
                <IdentityTitle>{profile.name}</IdentityTitle>
                <IdentityDescription>{profile.email}</IdentityDescription>
              </IdentityContent>
            </Identity>
            <ItemActions className="shrink-0 text-muted-foreground">
              <ChevronRightIcon className="size-4 rtl:rotate-180" aria-hidden />
            </ItemActions>
          </Item>
        </SettingsSection>

        <SettingsSection label={t("accountSettings.sections.security")}>
          {accountHubSections.map((item, index) => (
            <Fragment key={item.key}>
              {index > 0 ? <ItemSeparator className="my-0" /> : null}
              <SettingsNavItem
                title={t(item.labelKey)}
                description={t(item.descriptionKey)}
                icon={item.icon}
                href={item.href}
              />
            </Fragment>
          ))}
        </SettingsSection>
      </div>

      <AccountSettingsPanel
        section={openSection}
        onClose={() => setOpenSection(null)}
        profile={profile}
      />
    </>
  )
}
