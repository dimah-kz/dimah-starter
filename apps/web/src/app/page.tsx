import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { authRoutes } from "@/app/(auth)/lib/auth-routes"
import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"
import { Button } from "@repo/ui/components/button"
import { LayoutDashboardIcon, LogInIcon } from "lucide-react"
import { cn } from "cn"

const enterClassName =
  "animate-in fade-in-0 slide-in-from-bottom-3 fill-mode-both duration-500 ease-out motion-reduce:animate-none"

const ctaClassName = "h-9 gap-2 px-4 text-sm"

export default async function Home() {
  const t = await getTranslations("common")
  const tAuth = await getTranslations("auth")
  const tDashboard = await getTranslations("dashboard")

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16 text-center">
      <div className="flex max-w-lg flex-col gap-3">
        <h1
          className={cn(
            "text-3xl font-semibold tracking-tight text-balance",
            enterClassName
          )}
        >
          {t("home.title")}
        </h1>
        <p
          className={cn(
            "text-sm text-pretty text-muted-foreground",
            enterClassName,
            "delay-150"
          )}
        >
          {t("home.lede")}
        </p>
      </div>
      <div
        className={cn(
          "flex flex-wrap items-center justify-center gap-3",
          enterClassName,
          "delay-300"
        )}
      >
        <Button
          size="lg"
          className={ctaClassName}
          nativeButton={false}
          render={<Link href={authRoutes.login()} />}
        >
          <LogInIcon data-icon="inline-start" className="rtl:-scale-x-100" />
          {tAuth("login.title")}
        </Button>
        <Button
          variant="outline"
          size="lg"
          className={ctaClassName}
          nativeButton={false}
          render={<Link href={dashboardRoutes.home()} />}
        >
          <LayoutDashboardIcon data-icon="inline-start" />
          {tDashboard("nav.sidebar.dashboard")}
        </Button>
      </div>
    </main>
  )
}
