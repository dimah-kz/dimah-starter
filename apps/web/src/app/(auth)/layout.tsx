import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { AuthSettingsMenu } from "@/app/(auth)/components/auth-settings-menu"
import { BrandMark } from "@/components/brand-mark"

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const t = await getTranslations("common")

  return (
    <div className="grid min-h-svh w-full md:grid-cols-2">
      <div className="relative flex min-h-svh flex-col overflow-hidden border-border md:border-e">
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 bg-muted/50 dark:bg-muted/30" />
          <div className="absolute inset-0 bg-background/70 dark:bg-background/45" />
        </div>

        <div className="relative z-10 flex min-h-svh flex-col bg-card/80 backdrop-blur-xl dark:bg-card/60">
          <div className="flex items-center justify-between gap-3 p-4 md:p-6">
            <Link
              href="/"
              className="inline-flex min-w-0 items-center gap-2.5 rounded-lg text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <BrandMark className="size-8" />
              <span className="truncate text-sm font-semibold tracking-tight">
                {t("appTitle")}
              </span>
            </Link>
            <AuthSettingsMenu />
          </div>
          <div className="flex flex-1 flex-col items-center justify-center px-6 pb-10 md:px-12 lg:px-16">
            <div className="w-full max-w-sm">{children}</div>
          </div>
        </div>
      </div>

      <div
        className="relative hidden min-h-svh items-center justify-center bg-muted/60 md:flex dark:bg-muted/25"
        aria-hidden="true"
      >
        <BrandMark className="size-24" />
      </div>
    </div>
  )
}
