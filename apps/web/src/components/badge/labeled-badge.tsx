import { Badge } from "@repo/ui/components/badge"
import { cn } from "cn"
import type { ReactElement } from "react"

const lightVariants = {
  "primary-light":
    "border-primary/10 bg-primary/10 text-primary dark:border-primary/25 dark:bg-primary/15",
  "warning-light":
    "border-warning/15 bg-warning/10 text-warning-foreground dark:border-warning/25 dark:bg-warning/15 dark:text-warning",
  "success-light":
    "border-success/15 bg-success/10 text-success-foreground dark:border-success/25 dark:bg-success/15 dark:text-success",
  "info-light":
    "border-info/15 bg-info/10 text-info-foreground dark:border-info/25 dark:bg-info/15 dark:text-info",
  "destructive-light":
    "border-destructive/15 bg-destructive/10 text-destructive dark:border-destructive/25 dark:bg-destructive/15",
} as const

type LightVariant = keyof typeof lightVariants

export type LabeledBadgeVariant = "outline" | "secondary" | LightVariant

export type LabeledBadgeConfig = {
  label: string
  variant: LabeledBadgeVariant
  icon: ReactElement
  className?: string
}

function isLightVariant(variant: LabeledBadgeVariant): variant is LightVariant {
  return Object.hasOwn(lightVariants, variant)
}

export function LabeledBadge({
  label,
  variant,
  icon,
  className,
}: LabeledBadgeConfig) {
  return (
    <Badge
      variant={isLightVariant(variant) ? "ghost" : variant}
      className={cn(
        isLightVariant(variant) && lightVariants[variant],
        className
      )}
    >
      {icon}
      {label}
    </Badge>
  )
}
