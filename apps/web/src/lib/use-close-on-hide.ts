"use client"

import { useEffectEvent, useLayoutEffect } from "react"

/**
 * Closes an overlay when Cache Components hides its route in `<Activity>`,
 * so it is not open again when the route comes back.
 */
export function useCloseOnHide(open: boolean, close: () => void) {
  const closeOnHide = useEffectEvent(() => {
    if (open) {
      close()
    }
  })

  useLayoutEffect(() => {
    return () => {
      closeOnHide()
    }
  }, [])
}
