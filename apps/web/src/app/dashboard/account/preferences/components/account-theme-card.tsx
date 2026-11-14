"use client"

import { Suspense, use } from "react"
import { browser } from "react-dom"
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { SettingsCard } from "@/components/settings/settings-card"
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group"
import { cn } from "cn"
import { useTranslations } from "next-intl"

const themes = [
  { value: "light", icon: SunIcon },
  { value: "dark", icon: MoonIcon },
  { value: "system", icon: MonitorIcon },
] as const

type Theme = (typeof themes)[number]["value"]

export function AccountThemeCard() {
  const t = useTranslations("account.preferences.theme")

  return (
    <SettingsCard title={t("title")} description={t("description")}>
      <Suspense fallback={<ThemeOptions value={null} disabled />}>
        <ThemeOptionsReady />
      </Suspense>
    </SettingsCard>
  )
}

/** The theme is only known in the browser. */
function ThemeOptionsReady() {
  use(browser())
  const { theme, setTheme } = useTheme()

  return (
    <ThemeOptions
      value={
        themes.some(({ value }) => value === theme)
          ? (theme as Theme)
          : "system"
      }
      onChange={setTheme}
    />
  )
}

function ThemeOptions({
  value,
  onChange,
  disabled,
}: {
  value: Theme | null
  onChange?: (theme: Theme) => void
  disabled?: boolean
}) {
  const t = useTranslations("account.preferences.theme")

  return (
    <RadioGroup
      value={value}
      onValueChange={(next) => onChange?.(next as Theme)}
      disabled={disabled}
      aria-label={t("title")}
      className="grid grid-cols-3 gap-3"
    >
      {themes.map(({ value: option, icon: Icon }) => (
        <label
          key={option}
          className="group/theme flex cursor-pointer flex-col gap-2.5 has-disabled:cursor-default"
        >
          <span className="rounded-xl p-1 ring-1 ring-foreground/10 transition-shadow group-has-data-checked/theme:ring-2 group-has-data-checked/theme:ring-primary">
            <ThemePreview theme={option} />
          </span>
          <span className="flex items-center gap-2 px-0.5 text-sm">
            <RadioGroupItem value={option} />
            <Icon className="size-3.5 text-muted-foreground" aria-hidden />
            {t(option)}
          </span>
        </label>
      ))}
    </RadioGroup>
  )
}

/**
 * A tiny dashboard in that theme's colors. Fixed colors on purpose: each
 * preview shows its own theme whichever one is active.
 */
function ThemePreview({ theme }: { theme: Theme }) {
  if (theme === "system") {
    return (
      <span className="relative block overflow-hidden rounded-lg">
        <MiniWindow dark={false} />
        <span className="absolute inset-0 [clip-path:polygon(100%_0,100%_100%,0_100%)]">
          <MiniWindow dark />
        </span>
      </span>
    )
  }

  return (
    <span className="block overflow-hidden rounded-lg">
      <MiniWindow dark={theme === "dark"} />
    </span>
  )
}

function MiniWindow({ dark }: { dark: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex aspect-[4/3] gap-1.5 p-1.5",
        dark ? "bg-neutral-950" : "bg-neutral-100"
      )}
    >
      <span
        className={cn(
          "flex w-1/4 flex-col gap-1 rounded-sm p-1",
          dark ? "bg-neutral-900" : "bg-white"
        )}
      >
        <span
          className={cn(
            "h-1 w-full rounded-full",
            dark ? "bg-neutral-600" : "bg-neutral-300"
          )}
        />
        <span
          className={cn(
            "h-1 w-2/3 rounded-full",
            dark ? "bg-neutral-700" : "bg-neutral-200"
          )}
        />
        <span
          className={cn(
            "h-1 w-3/4 rounded-full",
            dark ? "bg-neutral-700" : "bg-neutral-200"
          )}
        />
      </span>
      <span className="flex flex-1 flex-col gap-1.5">
        <span
          className={cn(
            "h-2 w-1/2 rounded-full",
            dark ? "bg-neutral-700" : "bg-neutral-300"
          )}
        />
        <span
          className={cn(
            "flex-1 rounded-sm",
            dark ? "bg-neutral-900" : "bg-white"
          )}
        />
      </span>
    </span>
  )
}
