import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { AuthFormLayout } from "@/app/(auth)/components/auth-form-layout"

type VerifyEmailLayoutProps = {
  children: React.ReactNode
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.verifyEmail")

  return { title: t("title"), robots: { index: false } }
}

export default function VerifyEmailLayout({
  children,
}: VerifyEmailLayoutProps) {
  return <AuthFormLayout section="verifyEmail">{children}</AuthFormLayout>
}
