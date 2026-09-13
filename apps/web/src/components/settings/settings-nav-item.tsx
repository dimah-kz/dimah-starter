"use client"

import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ChevronRightIcon } from "lucide-react"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@repo/ui/components/item"
import { IconTile } from "@repo/ui/components/reui/icon-tile"

const itemTriggerClassName =
  "flex w-full min-w-0 items-center gap-2.5 text-start"

type SettingsNavItemProps = {
  title: string
  description: string
  icon: LucideIcon
  href?: string
  onClick?: () => void
}

export function SettingsNavItem({
  title,
  description,
  icon: Icon,
  href,
  onClick,
}: SettingsNavItemProps) {
  return (
    <Item
      className="rounded-none hover:bg-muted/50"
      role="listitem"
      render={
        href ? (
          <Link href={href} className={itemTriggerClassName} />
        ) : (
          <button
            type="button"
            className={itemTriggerClassName}
            onClick={onClick}
          />
        )
      }
    >
      <ItemMedia>
        <IconTile variant="outline" size="sm">
          <Icon aria-hidden />
        </IconTile>
      </ItemMedia>
      <ItemContent className="min-w-0">
        <ItemTitle className="text-sm">{title}</ItemTitle>
        <ItemDescription>{description}</ItemDescription>
      </ItemContent>
      <ItemActions className="shrink-0 text-muted-foreground">
        <ChevronRightIcon className="size-4 rtl:rotate-180" aria-hidden />
      </ItemActions>
    </Item>
  )
}
