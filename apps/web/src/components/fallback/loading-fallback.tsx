import { Spinner } from "@repo/ui/components/spinner"
import { cn } from "cn"

type LoadingFallbackShellProps = {
  label?: string
  className?: string
  /** Centers in the viewport and stays visible while the page scrolls. */
  overlay?: boolean
}

function LoadingFallback({ label }: { label?: string }) {
  return (
    <>
      <Spinner className="size-6 text-muted-foreground" />
      {label ? (
        <p className="text-center text-sm text-muted-foreground">{label}</p>
      ) : null}
    </>
  )
}

export function LoadingFallbackShell({
  label,
  className,
  overlay = false,
}: LoadingFallbackShellProps) {
  if (overlay) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className={cn(
          "fixed inset-0 z-50 flex flex-col items-center justify-center gap-2 bg-background/80 p-4 backdrop-blur-[2px]",
          className
        )}
      >
        <LoadingFallback label={label} />
      </div>
    )
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn(
        "flex min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center gap-2 p-4",
        className
      )}
    >
      <LoadingFallback label={label} />
    </div>
  )
}
