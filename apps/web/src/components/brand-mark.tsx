import { cn } from "cn"

/**
 * Dimah monogram — a geometric D in a rounded tile.
 * Keep the path identical to `app/icon.svg`.
 */
const brandMarkPath =
  "M8 0h16a8 8 0 0 1 8 8v16a8 8 0 0 1-8 8H8a8 8 0 0 1-8-8V8a8 8 0 0 1 8-8zM8.75 6.5h5a9.5 9.5 0 0 1 0 19H8.75zM13.75 11.5a4.5 4.5 0 0 1 0 9z"

type BrandMarkProps = {
  className?: string
}

export function BrandMark({ className }: BrandMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden="true"
      className={cn("shrink-0", className)}
    >
      <path fillRule="evenodd" d={brandMarkPath} />
    </svg>
  )
}
