import { Suspense } from "react"
import { authRoutes } from "@/app/(auth)/lib/auth-routes"
import { AuthCrossLink } from "@/app/(auth)/components/auth-cross-link"
import { getTranslations } from "next-intl/server"

type ForgotPasswordLayoutProps = {
  children: React.ReactNode
}

export default function ForgotPasswordLayout({
  children,
}: ForgotPasswordLayoutProps) {
  return (
    <div className="flex flex-col gap-4">
      <Suspense>
        <ForgotPasswordLayoutHeader />
      </Suspense>
      {children}
      <Suspense>
        <ForgotPasswordLayoutFooter />
      </Suspense>
    </div>
  )
}

async function ForgotPasswordLayoutHeader() {
  const t = await getTranslations("auth.forgotPassword")

  return (
    <div className="mb-6 text-center">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
    </div>
  )
}

async function ForgotPasswordLayoutFooter() {
  const t = await getTranslations("auth.forgotPassword")

  return (
    <div className="px-2 text-center text-sm">
      <AuthCrossLink
        className="font-medium text-primary"
        target={authRoutes.login()}
      >
        {t("backToSignIn")}
      </AuthCrossLink>
    </div>
  )
}
