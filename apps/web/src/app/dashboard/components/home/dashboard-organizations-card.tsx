"use client"

import * as React from "react"
import { CreateOrganizationFormShell } from "@/app/dashboard/components/sidebar/create-organization-form-shell"
import type { SidebarOrganizationItem } from "@/app/dashboard/components/sidebar/organization-switcher"
import { useOrganizationSwitch } from "@/app/dashboard/components/sidebar/organization-switcher"
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/avatar"
import { Button } from "@repo/ui/components/button"
import { IconTile } from "@repo/ui/components/reui/icon-tile"
import { cn } from "cn"
import { PlusIcon } from "lucide-react"
import { useTranslations } from "next-intl"

/** Square tile on top of the outline button. */
const tileClassName =
  "h-auto min-h-28 flex-col gap-2.5 rounded-lg p-4 text-center whitespace-normal"

type DashboardOrganizationsCardProps = {
  organizations: SidebarOrganizationItem[]
  activeOrganizationId: string | null
}

export function DashboardOrganizationsCard({
  organizations,
  activeOrganizationId,
}: DashboardOrganizationsCardProps) {
  const tSwitcher = useTranslations("dashboard.nav.organizationSwitcher")
  const { isSwitching, switchOrganization } = useOrganizationSwitch()
  const [createOpen, setCreateOpen] = React.useState(false)

  const handleSelectOrganization = (organizationId: string) => {
    if (organizationId === activeOrganizationId || isSwitching) {
      return
    }

    switchOrganization(organizationId)
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {organizations.map((organization) => {
          const isActive = organization.id === activeOrganizationId

          return (
            <Button
              key={organization.id}
              variant="outline"
              disabled={isSwitching}
              onClick={() => handleSelectOrganization(organization.id)}
              aria-current={isActive ? "true" : undefined}
              className={cn(
                tileClassName,
                "bg-card",
                isActive &&
                  "border-primary/40 bg-primary/8 ring-1 ring-primary/15"
              )}
            >
              <Avatar className="size-10 rounded-lg after:rounded-lg **:data-[slot=avatar-fallback]:rounded-lg **:data-[slot=avatar-image]:rounded-lg">
                {organization.logo ? (
                  <AvatarImage src={organization.logo} alt="" />
                ) : null}
                <AvatarFallback>
                  {organization.name[0]?.toUpperCase() ?? "?"}
                </AvatarFallback>
              </Avatar>
              <span className="line-clamp-2 w-full text-xs leading-snug font-medium">
                {organization.name}
              </span>
            </Button>
          )
        })}
        <Button
          variant="outline"
          disabled={isSwitching}
          onClick={() => setCreateOpen(true)}
          className={cn(tileClassName, "border-dashed text-muted-foreground")}
        >
          <IconTile variant="outline">
            <PlusIcon aria-hidden />
          </IconTile>
          <span className="text-xs font-medium">
            {tSwitcher("createOrganization")}
          </span>
        </Button>
      </div>

      <CreateOrganizationFormShell
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </>
  )
}
