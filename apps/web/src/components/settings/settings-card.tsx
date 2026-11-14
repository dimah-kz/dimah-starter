import type { ReactNode } from "react"
import { cn } from "cn"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card"

type SettingsCardProps = {
  title: string
  description?: ReactNode
  /** Beside the title, such as a status badge. */
  badge?: ReactNode
  /** On the end side of the header, such as an avatar. */
  aside?: ReactNode
  /** Footer text on the start side: what the action does, or a limit. */
  hint?: ReactNode
  /** Footer buttons on the end side. */
  actions?: ReactNode
  tone?: "default" | "destructive"
  className?: string
  children?: ReactNode
}

/**
 * One setting: a title and description, its control, and a footer with a hint
 * and the action. Wrap it in a `<form>` when the action submits the control.
 */
export function SettingsCard({
  title,
  description,
  badge,
  aside,
  hint,
  actions,
  tone = "default",
  className,
  children,
}: SettingsCardProps) {
  const destructive = tone === "destructive"

  return (
    <Card
      className={cn(
        "gap-0 py-0 [--card-spacing:--spacing(5)] sm:[--card-spacing:--spacing(6)]",
        destructive && "ring-destructive/30",
        className
      )}
    >
      <div className="flex items-start gap-4 py-(--card-spacing)">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <CardHeader className="gap-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle
                role="heading"
                aria-level={2}
                className={cn("text-base", destructive && "text-destructive")}
              >
                {title}
              </CardTitle>
              {badge}
            </div>
            {description ? (
              <CardDescription className="text-sm">
                {description}
              </CardDescription>
            ) : null}
          </CardHeader>
          {children ? <CardContent>{children}</CardContent> : null}
        </div>
        {aside ? (
          <div className="shrink-0 pe-(--card-spacing)">{aside}</div>
        ) : null}
      </div>
      {hint || actions ? (
        <CardFooter
          className={cn(
            "flex-col items-stretch gap-3 border-t py-3 sm:flex-row sm:items-center",
            destructive
              ? "border-destructive/20 bg-destructive/5"
              : "bg-muted/40"
          )}
        >
          {hint ? (
            <p className="text-sm text-muted-foreground">{hint}</p>
          ) : null}
          {actions ? (
            <div className="flex shrink-0 flex-wrap gap-2 sm:ms-auto">
              {actions}
            </div>
          ) : null}
        </CardFooter>
      ) : null}
    </Card>
  )
}
