import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { AuthFormLayout } from "@/app/(auth)/components/auth-form-layout"
import { authRoutes } from "@/app/(auth)/lib/auth-routes"

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
  return <AuthFormLayout section="login">{children}</AuthFormLayout>
}
