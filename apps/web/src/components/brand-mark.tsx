import { cn } from "cn"

/**
 * Dimah monogram — a compact geometric "d".
 * Curves are cubics (no semicircle arcs), so the edge stays smooth when scaled.
 * Keep this path identical to `app/icon.svg`.
 */
const brandMarkPath =
  "M12.6 1.15H15.15V12.15C15.15 15.43 12.88 18.26 9.68 18.98C6.48 19.7 3.22 18.1 1.82 15.14C0.42 12.17 1.27 8.64 3.85 6.63C6.44 4.61 10.07 4.66 12.6 6.75ZM12.6 12.15C12.6 14.61 10.61 16.6 8.15 16.6C5.69 16.6 3.7 14.61 3.7 12.15C3.7 9.69 5.69 7.7 8.15 7.7C10.61 7.7 12.6 9.69 12.6 12.15Z"

type BrandMarkProps = {
  className?: string
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 16.3 20.3"
      fill="currentColor"
      aria-hidden="true"
      shapeRendering="geometricPrecision"
      className={cn("h-5 w-auto shrink-0", className)}
    >
      <path fillRule="evenodd" d={brandMarkPath} />
    </svg>
  )
}
