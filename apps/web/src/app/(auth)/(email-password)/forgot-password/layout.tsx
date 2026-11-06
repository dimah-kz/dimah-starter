import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { AuthFormLayout } from "@/app/(auth)/components/auth-form-layout"

type ForgotPasswordLayoutProps = {
  children: React.ReactNode
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.forgotPassword")

  return { title: t("title"), robots: { index: false } }
}

export default function ForgotPasswordLayout({
  children,
}: ForgotPasswordLayoutProps) {
  return <AuthFormLayout section="forgotPassword">{children}</AuthFormLayout>
}
