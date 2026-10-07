import { Suspense } from "react"
import { authRoutes } from "@/app/(auth)/lib/auth-routes"
import { AuthCrossLink } from "@/app/(auth)/components/auth-cross-link"
import { getTranslations } from "next-intl/server"

type VerifyEmailLayoutProps = {
  children: React.ReactNode
}

export default function VerifyEmailLayout({
  children,
}: VerifyEmailLayoutProps) {
  return (
    <div className="flex flex-col gap-4">
      <Suspense>
        <VerifyEmailLayoutHeader />
      </Suspense>
      {children}
      <Suspense>
        <VerifyEmailLayoutFooter />
      </Suspense>
    </div>
  )
}

async function VerifyEmailLayoutHeader() {
  const t = await getTranslations("auth.verifyEmail")

  return (
    <div className="mb-6 text-center">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
    </div>
  )
}

async function VerifyEmailLayoutFooter() {
  const t = await getTranslations("auth.verifyEmail")

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
