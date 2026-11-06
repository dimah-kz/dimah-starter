"use client"

import { locales, type Locale } from "@repo/i18n"
import { setLocale } from "@/i18n/locale-actions"
import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@repo/ui/components/dropdown-menu"
import { IR, US } from "country-flag-icons/react/1x1"
import { CheckIcon } from "lucide-react"
import { useLocale, useTranslations } from "next-intl"
import { useTransition } from "react"

const localeOptions: Record<Locale, { label: string; Flag: typeof IR }> = {
  en: { label: "English", Flag: US },
  fa: { label: "فارسی", Flag: IR },
}

function LocaleFlag({ locale }: { locale: Locale }) {
  const { Flag } = localeOptions[locale]
  return <Flag aria-hidden className="size-3.5 rounded-xs" />
}

export function NavUserLocaleMenu() {
  const currentLocale = useLocale()
  const t = useTranslations("common")
  const [isPending, startTransition] = useTransition()

  if (locales.length < 2) {
    return null
  }

  return (
    <DropdownMenuSub>
      <DropdownMenuSubTrigger disabled={isPending}>
        <LocaleFlag locale={currentLocale} />
        {t("language")}
      </DropdownMenuSubTrigger>
      <DropdownMenuSubContent>
        {locales.map((locale) => {
          const isActive = locale === currentLocale

          return (
            <DropdownMenuItem
              key={locale}
              disabled={isPending}
              onClick={() => {
                if (isActive) {
                  return
                }

                // Setting the cookie in a Server Action re-renders the route.
                startTransition(() => setLocale(locale))
              }}
            >
              <LocaleFlag locale={locale} />
              <span className="flex-1">{localeOptions[locale].label}</span>
              {isActive ? (
                <CheckIcon className="text-muted-foreground" />
              ) : null}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuSubContent>
    </DropdownMenuSub>
  )
}
