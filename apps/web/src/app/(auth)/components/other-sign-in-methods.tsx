import type { ReactNode } from "react"
import { Marker, MarkerContent } from "@repo/ui/components/marker"
import { useTranslations } from "next-intl"

/** "Or continue with", then the sign-in buttons that skip the password form. */
export function OtherSignInMethods({ children }: { children: ReactNode }) {
  const t = useTranslations("auth.social")

  return (
    <div className="flex flex-col gap-3 pt-1">
      <Marker variant="separator">
        <MarkerContent>{t("continueWith")}</MarkerContent>
      </Marker>
      {children}
    </div>
  )
}
