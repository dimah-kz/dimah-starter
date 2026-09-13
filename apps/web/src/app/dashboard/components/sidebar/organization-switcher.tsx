"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { setActiveOrganizationAction } from "@/app/action/dashboard/components/set-active-organization-action"
import { CreateOrganizationFormShell } from "@/app/dashboard/components/sidebar/create-organization-form-shell"
import type { NavUserProfile } from "@/app/dashboard/components/sidebar/nav-user"
import { LoadingFallbackShell } from "@/components/fallback/loading-fallback"
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
import {
  Identity,
  IdentityAvatar,
  IdentityContent,
  IdentityDescription,
  IdentityTitle,
} from "@repo/ui/components/dimah/identity"
import { IconTile } from "@repo/ui/components/reui/icon-tile"
import { useSidebarFlyoutSide } from "@/app/dashboard/components/sidebar/sidebar-side"
import { Input } from "@repo/ui/components/input"
import { cn } from "cn"
import {
  CheckIcon,
  ChevronsUpDownIcon,
  Loader2Icon,
  PlusIcon,
  SearchIcon,
} from "lucide-react"
import { useTranslations } from "next-intl"

type OrganizationSwitchContextValue = {
  isSwitching: boolean
  switchOrganization: (organizationId: string | null) => void
}

const OrganizationSwitchContext =
  React.createContext<OrganizationSwitchContextValue | null>(null)

export function useOrganizationSwitch() {
  const context = React.useContext(OrganizationSwitchContext)

  if (!context) {
    throw new Error(
      "useOrganizationSwitch must be used within OrganizationSwitchProvider"
    )
  }

  return context
}

export function OrganizationSwitchProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [isSwitching, startTransition] = React.useTransition()

  const switchOrganization = React.useCallback(
    (organizationId: string | null) => {
      startTransition(async () => {
        const result = await setActiveOrganizationAction({ organizationId })
        router.replace(result.redirectTo)
        router.refresh()
      })
    },
    [router]
  )

  const value = React.useMemo(
    () => ({ isSwitching, switchOrganization }),
    [isSwitching, switchOrganization]
  )

  return (
    <OrganizationSwitchContext.Provider value={value}>
      {children}
    </OrganizationSwitchContext.Provider>
  )
}

export function OrganizationSwitchOverlay() {
  const { isSwitching } = useOrganizationSwitch()
  const t = useTranslations("dashboard.nav.organizationSwitcher")

  if (!isSwitching) {
    return null
  }

  return <LoadingFallbackShell overlay label={t("switching")} />
}

export type SidebarOrganizationItem = {
  id: string
  name: string
  logo: string | null
}

type OrganizationSwitcherProps = {
  user: NavUserProfile
  organizations: SidebarOrganizationItem[]
  activeOrganizationId: string | null
}

function CreateOrganizationMenuItem({ onSelect }: { onSelect: () => void }) {
  const t = useTranslations("dashboard.nav.organizationSwitcher")

  return (
    <DropdownMenuItem className="gap-2 p-2" onClick={onSelect}>
      <IconTile variant="outline" size="xs">
        <PlusIcon />
      </IconTile>
      <span className="font-medium text-muted-foreground">
        {t("createOrganization")}
      </span>
    </DropdownMenuItem>
  )
}

const switcherAvatarClassName = {
  menu: "rounded-md after:rounded-md **:data-[slot=avatar-fallback]:rounded-md **:data-[slot=avatar-image]:rounded-md",
  trigger:
    "rounded-lg after:rounded-lg **:data-[slot=avatar-fallback]:rounded-lg **:data-[slot=avatar-image]:rounded-lg",
} as const

function PersonalAccountMenuItem({
  user,
  isActive,
  disabled,
  onSelect,
}: {
  user: NavUserProfile
  isActive: boolean
  disabled: boolean
  onSelect: () => void
}) {
  const t = useTranslations("dashboard.nav.organizationSwitcher")

  return (
    <DropdownMenuItem
      onClick={onSelect}
      disabled={disabled || isActive}
      className="p-2"
      aria-current={isActive ? "true" : undefined}
    >
      <Identity size="sm">
        <IdentityAvatar
          src={user.avatar}
          name={user.name}
          className={switcherAvatarClassName.menu}
        />
        <IdentityContent>
          <IdentityTitle>{t("personalAccount")}</IdentityTitle>
        </IdentityContent>
        {isActive ? <CheckIcon className="text-muted-foreground" /> : null}
      </Identity>
    </DropdownMenuItem>
  )
}

export function OrganizationSwitcher({
  user,
  organizations,
  activeOrganizationId,
}: OrganizationSwitcherProps) {
  const t = useTranslations("dashboard.nav.organizationSwitcher")
  const { isMobile } = useSidebar()
  const flyoutSide = useSidebarFlyoutSide(isMobile)
  const { isSwitching, switchOrganization } = useOrganizationSwitch()
  const [createOpen, setCreateOpen] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const isPersonalAccount = activeOrganizationId === null

  const filteredOrganizations = React.useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) {
      return organizations
    }

    return organizations.filter((organization) =>
      organization.name.toLowerCase().includes(query)
    )
  }, [organizations, search])

  const handleMenuOpenChange = (nextOpen: boolean) => {
    setMenuOpen(nextOpen)

    if (!nextOpen) {
      setSearch("")
    }
  }

  const isSearching = search.trim().length > 0

  const activeOrganization = React.useMemo(
    () =>
      organizations.find(
        (organization) => organization.id === activeOrganizationId
      ) ?? null,
    [organizations, activeOrganizationId]
  )

  const handleSwitchToPersonal = () => {
    if (isPersonalAccount || isSwitching) {
      return
    }

    switchOrganization(null)
  }

  const handleSwitchToOrganization = (organizationId: string) => {
    if (organizationId === activeOrganizationId || isSwitching) {
      return
    }

    switchOrganization(organizationId)
  }

  const createForm = (
    <CreateOrganizationFormShell
      open={createOpen}
      onClose={() => setCreateOpen(false)}
    />
  )

  const dropdownContent = (
    <DropdownMenuContent
      className="min-w-56"
      align="start"
      side={flyoutSide}
      sideOffset={4}
    >
      {organizations.length > 0 ? (
        <>
          <div
            className="px-2 py-1.5"
            onPointerDown={(event) => event.stopPropagation()}
          >
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute inset-s-2.5 top-1/2 size-3.5 -translate-y-1/2 opacity-50" />
              <Input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("search")}
                className="h-7 border-none bg-transparent ps-8 shadow-none focus-visible:ring-0"
                aria-label={t("search")}
                onKeyDown={(event) => event.stopPropagation()}
              />
            </div>
          </div>
          <DropdownMenuSeparator />
        </>
      ) : null}
      {!isSearching ? (
        <DropdownMenuGroup>
          <PersonalAccountMenuItem
            user={user}
            isActive={isPersonalAccount}
            disabled={isSwitching}
            onSelect={handleSwitchToPersonal}
          />
        </DropdownMenuGroup>
      ) : null}
      {organizations.length > 0 ? (
        <>
          {!isSearching ? <DropdownMenuSeparator /> : null}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              {t("organizations")} ({filteredOrganizations.length})
            </DropdownMenuLabel>
            {filteredOrganizations.map((organization) => {
              const isActive = organization.id === activeOrganizationId

              return (
                <DropdownMenuItem
                  key={organization.id}
                  onClick={() => handleSwitchToOrganization(organization.id)}
                  disabled={isSwitching || isActive}
                  className="p-2"
                  aria-current={isActive ? "true" : undefined}
                >
                  <Identity size="sm">
                    <IdentityAvatar
                      src={organization.logo}
                      name={organization.name}
                      className={switcherAvatarClassName.menu}
                    />
                    <IdentityContent>
                      <IdentityTitle>{organization.name}</IdentityTitle>
                    </IdentityContent>
                    {isActive ? (
                      <CheckIcon className="text-muted-foreground" />
                    ) : null}
                  </Identity>
                </DropdownMenuItem>
              )
            })}
          </DropdownMenuGroup>
        </>
      ) : null}
      <DropdownMenuSeparator />
      <CreateOrganizationMenuItem onSelect={() => setCreateOpen(true)} />
    </DropdownMenuContent>
  )

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu open={menuOpen} onOpenChange={handleMenuOpenChange}>
            <DropdownMenuTrigger
              disabled={isSwitching}
              render={
                <SidebarMenuButton
                  size="lg"
                  className="data-open:bg-sidebar-accent data-open:text-sidebar-accent-foreground"
                  aria-busy={isSwitching}
                />
              }
            >
              <Identity className="w-auto flex-1">
                {isPersonalAccount ? (
                  <>
                    <IdentityAvatar
                      src={user.avatar}
                      name={user.name}
                      className={switcherAvatarClassName.trigger}
                    />
                    <IdentityContent>
                      <IdentityTitle>{user.name}</IdentityTitle>
                      <IdentityDescription>
                        {t("personalAccount")}
                      </IdentityDescription>
                    </IdentityContent>
                  </>
                ) : (
                  <>
                    <IdentityAvatar
                      src={activeOrganization?.logo}
                      name={activeOrganization?.name}
                      className={cn(
                        switcherAvatarClassName.trigger,
                        "**:data-[slot=avatar-fallback]:bg-sidebar-primary **:data-[slot=avatar-fallback]:text-sidebar-primary-foreground"
                      )}
                    />
                    <IdentityContent>
                      <IdentityTitle>{activeOrganization?.name}</IdentityTitle>
                      <IdentityDescription>
                        {t("activeOrganization")}
                      </IdentityDescription>
                    </IdentityContent>
                  </>
                )}
                <ChevronsUpDownIcon
                  className={cn("ms-auto opacity-55", isSwitching && "hidden")}
                />
                {isSwitching ? (
                  <Loader2Icon className="ms-auto size-4 animate-spin opacity-70" />
                ) : null}
              </Identity>
            </DropdownMenuTrigger>
            {dropdownContent}
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      {createForm}
    </>
  )
}
