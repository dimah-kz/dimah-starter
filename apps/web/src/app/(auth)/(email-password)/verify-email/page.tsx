import { Suspense } from "react"
import { getTranslations } from "next-intl/server"

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailCopy />
    </Suspense>
  )
}

async function VerifyEmailCopy() {
  const t = await getTranslations("auth.verifyEmail")

  return (
    <div className="space-y-2 text-center text-sm text-muted-foreground">
      <p>{t("description")}</p>
      <p>{t("resend")}</p>
    </div>
  )
}
