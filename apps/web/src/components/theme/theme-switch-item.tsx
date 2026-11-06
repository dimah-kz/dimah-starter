"use client"

import { Suspense, use } from "react"
import { browser } from "react-dom"
import { MoonIcon } from "lucide-react"
import { useTranslations } from "next-intl"
import { useTheme } from "next-themes"
import { DropdownMenuCheckboxItem } from "@repo/ui/components/dropdown-menu"

function DarkThemeItem({
  checked,
  disabled,
  onCheckedChange,
}: {
  checked: boolean
  disabled?: boolean
  onCheckedChange?: (checked: boolean) => void
}) {
  const t = useTranslations("common")

  return (
    <DropdownMenuCheckboxItem
      checked={checked}
      disabled={disabled}
      onCheckedChange={onCheckedChange}
    >
      <MoonIcon />
      {t("darkTheme")}
    </DropdownMenuCheckboxItem>
  )
}

/** The theme is only known in the browser. */
function DarkThemeItemReady() {
  use(browser())
  const { resolvedTheme, setTheme } = useTheme()

  return (
    <DarkThemeItem
      checked={resolvedTheme === "dark"}
      onCheckedChange={(checked) => {
        setTheme(checked ? "dark" : "light")
      }}
    />
  )
}

export function ThemeSwitchItem() {
  return (
    <Suspense fallback={<DarkThemeItem checked={false} disabled />}>
      <DarkThemeItemReady />
    </Suspense>
  )
}
