import type { ReactNode } from "react"
import { cn } from "cn"
import { Marker, MarkerContent } from "@repo/ui/components/marker"
import { useTranslations } from "next-intl"

type OtherSignInMethodsProps = {
  /** How many sign-in buttons share the row. */
  columns?: 1 | 2
  children: ReactNode
}

/**
 * "Or continue with", then the sign-in buttons that skip the password form,
 * side by side. Each child puts its button first (`order-first`) and spans an
 * error across the row below (`col-span-full`).
 */
export function OtherSignInMethods({
  columns = 1,
  children,
}: OtherSignInMethodsProps) {
  const t = useTranslations("auth.social")

  return (
    <div className="flex flex-col gap-3 pt-1">
      <Marker variant="separator">
        <MarkerContent>{t("continueWith")}</MarkerContent>
      </Marker>
      <div
        className={cn(
          "grid gap-3",
          columns === 2 ? "grid-cols-2" : "grid-cols-1"
        )}
      >
        {children}
      </div>
    </div>
  )
}
