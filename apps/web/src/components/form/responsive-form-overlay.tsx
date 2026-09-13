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
import { cn } from "cn"

export type ResponsiveFormOverlayProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  footer: ReactNode
  children: ReactNode
  headerClassName?: string
  contentClassName?: string
  footerClassName?: string
}

export function ResponsiveFormOverlay({
  open,
  onOpenChange,
  title,
  description,
  footer,
  children,
  headerClassName,
  contentClassName,
  footerClassName,
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
        <SheetHeader className={cn("p-4 pe-14", headerClassName)}>
          <SheetTitle>{title}</SheetTitle>
          {description ? (
            <SheetDescription>{description}</SheetDescription>
          ) : null}
        </SheetHeader>
        <div
          className={cn("min-h-0 flex-1 overflow-y-auto p-4", contentClassName)}
        >
          {children}
        </div>
        <SheetFooter className={cn("p-4", footerClassName)}>
          {footer}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
