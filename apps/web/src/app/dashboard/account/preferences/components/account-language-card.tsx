"use client"

import { useTransition } from "react"
import { localeOptions } from "@/components/locale/locale-switcher"
import { SettingsCard } from "@/components/settings/settings-card"
import { setLocale } from "@/i18n/locale-actions"
import { isValidLocale, locales } from "@repo/i18n"
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group"
import { useLocale, useTranslations } from "next-intl"

export function AccountLanguageCard() {
  const t = useTranslations("account.preferences.language")
  const currentLocale = useLocale()
  const [isPending, startTransition] = useTransition()

  return (
    <SettingsCard title={t("title")} description={t("description")}>
      <RadioGroup
        value={currentLocale}
        onValueChange={(next) => {
          if (typeof next === "string" && isValidLocale(next)) {
            // Setting the cookie in a Server Action re-renders the route.
            startTransition(() => setLocale(next))
          }
        }}
        disabled={isPending}
        aria-label={t("title")}
        className="grid gap-2 sm:grid-cols-2"
      >
        {locales.map((locale) => {
          const { label, Flag } = localeOptions[locale]

          return (
            <label
              key={locale}
              lang={locale}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm ring-1 ring-foreground/10 transition-shadow has-disabled:cursor-default has-data-checked:ring-2 has-data-checked:ring-primary"
            >
              <Flag aria-hidden className="size-5 rounded-full" />
              <span className="flex-1">{label}</span>
              <RadioGroupItem value={locale} />
            </label>
          )
        })}
      </RadioGroup>
    </SettingsCard>
  )
}
