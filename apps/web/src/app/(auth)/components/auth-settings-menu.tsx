"use client"

import Link from "next/link"
import { NavUserLocaleMenu } from "@/components/locale/locale-switcher"
import { ThemeSwitchItem } from "@/components/theme/theme-switch-item"
import { Button } from "@repo/ui/components/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu"
import { cn } from "cn"
import { HomeIcon, SettingsIcon } from "lucide-react"
import { useTranslations } from "next-intl"

type AuthSettingsMenuProps = {
  className?: string
  showHome?: boolean
}

export function AuthSettingsMenu({
  className,
  showHome = true,
}: AuthSettingsMenuProps) {
  const t = useTranslations("common")

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "border-0 bg-card/60 shadow-none ring-0 backdrop-blur-xl",
              className
            )}
            aria-label={t("settings")}
          />
        }
      >
        <SettingsIcon />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={4} className="min-w-56">
        <ThemeSwitchItem />
        <DropdownMenuGroup>
          <NavUserLocaleMenu />
        </DropdownMenuGroup>
        {showHome ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem render={<Link href="/" />}>
              <HomeIcon />
              {t("goHome")}
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
