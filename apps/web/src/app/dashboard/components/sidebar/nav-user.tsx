"use client"

import * as React from "react"
import Link from "next/link"
import { logoutAction } from "@/app/action/dashboard/components/logout-action"
import { NavUserLocaleMenu } from "@/components/locale/locale-switcher"
import { ThemeSwitchItem } from "@/components/theme/theme-switch-item"
import { useSidebarFlyoutSide } from "@/app/dashboard/components/sidebar/sidebar-side"
import {
  Identity,
  IdentityAvatar,
  IdentityContent,
  IdentityDescription,
  IdentityTitle,
} from "@repo/ui/components/dimah/identity"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@repo/ui/components/sidebar"
import { ChevronsUpDownIcon, HomeIcon, LogOutIcon } from "lucide-react"
import { useTranslations } from "next-intl"

export type NavUserProfile = {
  name: string
  email: string
  avatar: string
}

export function NavUser({ user }: { user: NavUserProfile }) {
  const t = useTranslations()
  const { isMobile } = useSidebar()
  const flyoutSide = useSidebarFlyoutSide(isMobile)
  const [isPending, startTransition] = React.useTransition()
  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction()
    })
  }

  const userSummary = (
    <Identity className="w-auto flex-1">
      <IdentityAvatar src={user.avatar} name={user.name} />
      <IdentityContent>
        <IdentityTitle>{user.name}</IdentityTitle>
        <IdentityDescription>{user.email}</IdentityDescription>
      </IdentityContent>
    </Identity>
  )

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            {userSummary}
            <ChevronsUpDownIcon className="ms-auto size-4 opacity-55" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56"
            side={flyoutSide}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="px-1 py-1.5">{userSummary}</div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem render={<Link href="/" />}>
                <HomeIcon />
                {t("common.goHome")}
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <ThemeSwitchItem />
            <DropdownMenuGroup>
              <NavUserLocaleMenu />
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              disabled={isPending}
              onClick={handleLogout}
            >
              <LogOutIcon />
              {isPending ? t("common.signingOut") : t("common.signOut")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
