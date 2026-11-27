import { Badge, type BadgeProps } from "@repo/ui/components/reui/badge"
import { cn } from "cn"
import type { ReactElement } from "react"

export type LabeledBadgeVariant = NonNullable<BadgeProps["variant"]>

export type LabeledBadgeConfig = {
  label: string
  variant: LabeledBadgeVariant
  icon: ReactElement
  className?: string
}

export function LabeledBadge({
  label,
  variant,
  icon,
  className,
}: LabeledBadgeConfig) {
  return (
    <Badge variant={variant} size="sm" radius="full" className={cn(className)}>
      {icon}
      {label}
    </Badge>
  )
}
