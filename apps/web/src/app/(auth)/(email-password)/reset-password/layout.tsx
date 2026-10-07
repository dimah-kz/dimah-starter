import { Suspense } from "react"
import { getTranslations } from "next-intl/server"

type ResetPasswordLayoutProps = {
  children: React.ReactNode
}

export default function ResetPasswordLayout({
  children,
}: ResetPasswordLayoutProps) {
  return (
    <div className="flex flex-col gap-4">
      <Suspense>
        <ResetPasswordLayoutHeader />
      </Suspense>
      {children}
    </div>
  )
}

async function ResetPasswordLayoutHeader() {
  const t = await getTranslations("auth.resetPassword")

  return (
    <div className="mb-6 text-center">
      <h1 className="text-2xl font-semibold">{t("title")}</h1>
    </div>
  )
}
