"use client"

import { locales, type Locale } from "@repo/i18n"
import { setLocale } from "@/i18n/locale-actions"
import {
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@repo/ui/components/dropdown-menu"
import { cn } from "cn"
import { IR, US } from "country-flag-icons/react/1x1"
import { CheckIcon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useLocale, useTranslations } from "next-intl"
import { useTransition, type ComponentProps } from "react"

export const localeOptions: Record<Locale, { label: string; Flag: typeof IR }> =
  {
    en: { label: "English", Flag: US },
    fa: { label: "فارسی", Flag: IR },
  }

export function LocaleFlag({
  locale,
  className,
  ...props
}: Readonly<
  { locale: Locale } & Omit<ComponentProps<typeof IR>, "className"> & {
      className?: string
    }
>) {
  const Flag = localeOptions[locale].Flag
  return (
    <Flag
      aria-hidden
      className={cn("size-3.5 rounded-xs", className)}
      {...props}
    />
  )
}

export function NavUserLocaleMenu() {
  const router = useRouter()
  const currentLocale = useLocale() as Locale
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
          const option = localeOptions[locale]
          const isActive = locale === currentLocale

          return (
            <DropdownMenuItem
              key={locale}
              disabled={isPending}
              onClick={() => {
                if (isActive) {
                  return
                }

                startTransition(async () => {
                  await setLocale(locale)
                  router.refresh()
                })
              }}
            >
              <LocaleFlag locale={locale} />
              <span className="flex-1">{option.label}</span>
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
