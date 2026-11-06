import { Label } from "@repo/ui/components/label"
import { cn } from "cn"

function RequiredMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn("leading-none text-destructive", className)}
    >
      *
    </span>
  )
}

type FormLabelProps = React.ComponentProps<typeof Label> & {
  required?: boolean
}

export function FormLabel({
  required = false,
  children,
  className,
  ...props
}: FormLabelProps) {
  return (
    <Label className={cn("gap-1", className)} {...props}>
      {children}
      {required ? <RequiredMark /> : null}
    </Label>
  )
}
