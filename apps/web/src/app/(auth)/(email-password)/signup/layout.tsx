import type { Metadata } from "next"
import { Suspense } from "react"
import { authRoutes } from "@/app/(auth)/lib/auth-routes"
import { AuthCrossLink } from "@/app/(auth)/components/auth-cross-link"
import { getTranslations } from "next-intl/server"

type SignUpLayoutProps = {
  children: React.ReactNode
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.signup")

  return {
    title: t("title"),
    alternates: { canonical: authRoutes.signup() },
  }
}

export default function SignUpLayout({ children }: SignUpLayoutProps) {
  return (
    <div className="flex flex-col gap-4">
      <Suspense>
        <SignUpLayoutHeader />
      </Suspense>
      {children}
      <Suspense>
        <SignUpLayoutFooter />
      </Suspense>
    </div>
  )
}

async function SignUpLayoutHeader() {
  const t = await getTranslations("auth.signup")

  return (
    <div className="mb-6 text-center">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
    </div>
  )
}

async function SignUpLayoutFooter() {
  const t = await getTranslations("auth.signup")

  return (
    <div className="px-2 text-center text-sm">
      <p className="text-muted-foreground">
        {t("hasAccount")}{" "}
        <AuthCrossLink
          className="font-medium text-primary"
          target={authRoutes.login()}
        >
          {t("signInLink")}
        </AuthCrossLink>
      </p>
    </div>
  )
}
