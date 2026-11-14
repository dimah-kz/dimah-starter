import type { Metadata } from "next"
import { getTranslations } from "next-intl/server"
import { AuthFormLayout } from "@/app/(auth)/components/auth-form-layout"

type TwoFactorLayoutProps = {
  children: React.ReactNode
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.twoFactor")

  return { title: t("title"), robots: { index: false } }
}

export default function TwoFactorLayout({ children }: TwoFactorLayoutProps) {
  return <AuthFormLayout section="twoFactor">{children}</AuthFormLayout>
}
