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
    <p className="text-center text-sm text-muted-foreground">
      {t("description")}
    </p>
  )
}
