"use client"

import { useDirection } from "@repo/ui/components/direction"

export function useSidebarSide(): "left" | "right" {
  return useDirection() === "rtl" ? "right" : "left"
}

export function useSidebarFlyoutSide(
  isMobile: boolean
): "bottom" | "left" | "right" {
  const direction = useDirection()

  if (isMobile) {
    return "bottom"
  }

  return direction === "rtl" ? "left" : "right"
}
