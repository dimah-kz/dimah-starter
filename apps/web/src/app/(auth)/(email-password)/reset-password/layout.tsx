import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { AuthFormLayout } from "@/app/(auth)/components/auth-form-layout"

type ResetPasswordLayoutProps = {
  children: React.ReactNode
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.resetPassword")

  return { title: t("title"), robots: { index: false } }
}

export default function ResetPasswordLayout({
  children,
}: ResetPasswordLayoutProps) {
  return <AuthFormLayout section="resetPassword">{children}</AuthFormLayout>
}
