import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { AuthFormLayout } from "@/app/(auth)/components/auth-form-layout"
import { authRoutes } from "@/app/(auth)/lib/auth-routes"

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
  return <AuthFormLayout section="signup">{children}</AuthFormLayout>
}
