import type { Metadata } from "next"
import { Suspense } from "react"
import { authRoutes } from "@/app/(auth)/lib/auth-routes"
import { AuthCrossLink } from "@/app/(auth)/components/auth-cross-link"
import { getTranslations } from "next-intl/server"

type LoginLayoutProps = {
  children: React.ReactNode
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.login")

  return {
    title: t("title"),
    alternates: { canonical: authRoutes.login() },
  }
}

export default function LoginLayout({ children }: LoginLayoutProps) {
  return (
    <div className="flex flex-col gap-4">
      <Suspense>
        <LoginLayoutHeader />
      </Suspense>
      {children}
      <Suspense>
        <LoginLayoutFooter />
      </Suspense>
    </div>
  )
}

async function LoginLayoutHeader() {
  const t = await getTranslations("auth.login")

  return (
    <div className="mb-6 text-center">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
    </div>
  )
}

async function LoginLayoutFooter() {
  const t = await getTranslations("auth.login")

  return (
    <div className="px-2 text-center text-sm">
      <p className="text-muted-foreground">
        {t("noAccount")}{" "}
        <AuthCrossLink
          className="font-medium text-primary"
          target={authRoutes.signup()}
        >
          {t("signUpLink")}
        </AuthCrossLink>
      </p>
    </div>
  )
}
