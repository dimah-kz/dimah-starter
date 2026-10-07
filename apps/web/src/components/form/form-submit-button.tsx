"use client"

import { useFormStatus } from "react-dom"
import { Button } from "@repo/ui/components/button"
import { Spinner } from "@repo/ui/components/spinner"
import { cn } from "cn"

type FormSubmitButtonProps = {
  idleText: string
  loadingText: string
  className?: string
  disabled?: boolean
  variant?: React.ComponentProps<typeof Button>["variant"]
}

export function FormSubmitButton({
  idleText,
  loadingText,
  className,
  disabled,
  variant,
}: FormSubmitButtonProps) {
  const { pending } = useFormStatus()
  const isDisabled = pending || disabled

  return (
    <Button
      type="submit"
      variant={variant}
      className={cn("w-full", className)}
      disabled={isDisabled}
      aria-busy={pending}
    >
      {pending ? (
        <span className="inline-flex items-center gap-2">
          <Spinner className="size-4" />
          {loadingText}
        </span>
      ) : (
        idleText
      )}
    </Button>
  )
}
