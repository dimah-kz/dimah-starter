"use client"

import { useMemo } from "react"
import { encode } from "uqr"

type QrCodeProps = {
  value: string
  label: string
}

/**
 * Dark modules on white in both themes: scanners expect that contrast. Drawn
 * as one SVG path, so it stays sharp at any size.
 */
export function QrCode({ value, label }: QrCodeProps) {
  const { path, size } = useMemo(() => {
    const { data } = encode(value, { ecc: "M", border: 2 })
    let d = ""

    data.forEach((row, y) => {
      row.forEach((dark, x) => {
        if (dark) {
          d += `M${x} ${y}h1v1h-1z`
        }
      })
    })

    return { path: d, size: data.length }
  }, [value])

  return (
    <svg
      role="img"
      aria-label={label}
      viewBox={`0 0 ${size} ${size}`}
      shapeRendering="crispEdges"
      className="size-44 rounded-lg bg-white ring-1 ring-foreground/10"
    >
      <path d={path} fill="#000" />
    </svg>
  )
}
