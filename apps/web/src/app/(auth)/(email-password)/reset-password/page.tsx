import { Suspense } from "react"
import { ResetPasswordForm } from "@/app/(auth)/(email-password)/reset-password/components/reset-password-form"
import { AuthCrossLink } from "@/app/(auth)/components/auth-cross-link"
import { normalizeAuthRedirectTarget } from "@/app/(auth)/lib/auth-redirect"
import { authRoutes } from "@/app/(auth)/lib/auth-routes"
import { getTranslations } from "next-intl/server"

type ResetPasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default function ResetPasswordPage({
  searchParams,
}: ResetPasswordPageProps) {
  return (
    <Suspense>
      <ResetPasswordPageContent searchParams={searchParams} />
    </Suspense>
  )
}

async function ResetPasswordPageContent({
  searchParams,
}: ResetPasswordPageProps) {
  const params = await searchParams
  const token = typeof params.token === "string" ? params.token : ""
  const error = typeof params.error === "string" ? params.error : ""
  const redirectTo = normalizeAuthRedirectTarget(
    typeof params.redirect === "string" ? params.redirect : undefined
  )

  if (!token || error === "INVALID_TOKEN") {
    return <InvalidResetLink />
  }

  return <ResetPasswordForm token={token} redirectTo={redirectTo} />
}

async function InvalidResetLink() {
  const t = await getTranslations("auth.resetPassword")

  return (
    <div className="space-y-4 text-center">
      <p className="text-sm text-muted-foreground">{t("invalid")}</p>
      <AuthCrossLink
        className="text-sm font-medium text-primary"
        target={authRoutes.forgotPassword()}
      >
        {t("requestAgain")}
      </AuthCrossLink>
    </div>
  )
}
