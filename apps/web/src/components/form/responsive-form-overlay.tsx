"use client"

import { useEffectEvent, useLayoutEffect, type ReactNode } from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@repo/ui/components/sheet"

type ResponsiveFormOverlayProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  footer: ReactNode
  children: ReactNode
}

export function ResponsiveFormOverlay({
  open,
  onOpenChange,
  title,
  description,
  footer,
  children,
}: ResponsiveFormOverlayProps) {
  const closeOnHide = useEffectEvent(() => {
    if (open) {
      onOpenChange(false)
    }
  })

  useLayoutEffect(() => {
    return () => {
      closeOnHide()
    }
  }, [])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="p-0 max-sm:w-full!">
        <SheetHeader className="p-4 pe-14">
          <SheetTitle>{title}</SheetTitle>
          {description ? (
            <SheetDescription>{description}</SheetDescription>
          ) : null}
        </SheetHeader>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">{children}</div>
        <SheetFooter className="p-4">{footer}</SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
