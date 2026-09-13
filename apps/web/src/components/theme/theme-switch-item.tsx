"use client"

import { Suspense, use } from "react"
import { browser } from "react-dom"
import { MoonIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { Switch } from "@repo/ui/components/switch"

function ThemeSwitchRow({
  checked,
  disabled,
  label,
  onCheckedChange,
}: {
  checked: boolean
  disabled: boolean
  label: string
  onCheckedChange?: (checked: boolean) => void
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className="relative flex min-h-7 items-center justify-between gap-2 rounded-md px-2 py-1 text-xs/relaxed select-none [&_svg]:size-3.5 [&_svg]:shrink-0"
    >
      <MoonIcon className="pointer-events-none" />
      <span className="flex-1">{label}</span>
      <Switch
        size="sm"
        checked={checked}
        disabled={disabled}
        aria-label={label}
        onCheckedChange={onCheckedChange}
      />
    </div>
  )
}

function ThemeSwitchReady() {
  use(browser())
  const t = useTranslations("common")
  const { resolvedTheme, setTheme } = useTheme()
  const label = t("darkTheme")

  return (
    <ThemeSwitchRow
      checked={resolvedTheme === "dark"}
      disabled={false}
      label={label}
      onCheckedChange={(checked) => {
        setTheme(checked ? "dark" : "light")
      }}
    />
  )
}

function ThemeSwitchFallback() {
  const t = useTranslations("common")
  const label = t("darkTheme")

  return <ThemeSwitchRow checked={false} disabled label={label} />
}

export function ThemeSwitchItem() {
  return (
    <Suspense fallback={<ThemeSwitchFallback />}>
      <ThemeSwitchReady />
    </Suspense>
  )
}
