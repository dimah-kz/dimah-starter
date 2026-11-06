import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { AuthSettingsMenu } from "@/app/(auth)/components/auth-settings-menu"
import { GitHubIcon } from "@/app/(marketing)/components/github-icon"
import { marketingRoutes } from "@/app/(marketing)/lib/marketing-routes"
import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"
import { BrandMark } from "@/components/brand-mark"
import { siteLinks } from "@/lib/site"
import { Button } from "@repo/ui/components/button"
import { cn } from "cn"
import { ArrowUpRightIcon, LayoutDashboardIcon } from "lucide-react"

const navItems = [
  { key: "features", href: marketingRoutes.features() },
  { key: "quickStart", href: marketingRoutes.quickStart() },
] as const

const navLinkClassName =
  "rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"

/** Shell for public pages: add `/pricing`, `/blog`, legal pages, … beside `page.tsx`. */
export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [t, tc] = await Promise.all([
    getTranslations("marketing"),
    getTranslations("common"),
  ])
  const appTitle = tc("appTitle")
  const newTabLabel = t("opensInNewTab")

  const brandLink = (
    <Link
      href={marketingRoutes.home()}
      className="inline-flex min-w-0 items-center gap-2.5 rounded-md text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <BrandMark />
      <span className="truncate text-sm font-semibold tracking-tight">
        {appTitle}
      </span>
    </Link>
  )

  return (
    <div className="relative isolate flex min-h-svh flex-1 flex-col">
      {/* Grid and glow start at the page top, so the glass header sits on them.
          Grid rows match the header (h-14 = 3.5rem); the 55px offset lands a
          grid line on the header's bottom border. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[40rem] overflow-hidden"
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black_20%,transparent_100%)] [background-size:3.5rem_3.5rem] [background-position:center_55px] opacity-60" />
        <div className="absolute inset-x-0 -top-20 mx-auto h-72 max-w-3xl rounded-full bg-linear-to-r from-[#FF1E56]/15 to-[#0196FF]/15 blur-3xl" />
      </div>

      <a
        href="#main"
        className="sr-only rounded-md bg-background px-3 py-2 text-sm font-medium shadow-sm ring-2 ring-ring focus:not-sr-only focus:fixed focus:start-4 focus:top-3 focus:z-50"
      >
        {t("nav.skipToContent")}
      </a>

      <header className="sticky top-0 z-40 border-b border-border/75 bg-background/50 backdrop-blur-lg">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
          {brandLink}

          <nav aria-label={t("nav.label")} className="hidden md:block">
            <ul className="flex items-center gap-1">
              {navItems.map(({ key, href }) => (
                <li key={key}>
                  <Link href={href} className={navLinkClassName}>
                    {t(`nav.${key}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="ms-auto flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon-lg"
              nativeButton={false}
              className="hidden sm:inline-flex"
              render={
                <a
                  href={siteLinks.github}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${t("nav.github")} ${newTabLabel}`}
                />
              }
            >
              <GitHubIcon />
            </Button>
            <AuthSettingsMenu
              showHome={false}
              className="size-8 bg-transparent backdrop-blur-none dark:bg-transparent"
            />
            <Button
              size="lg"
              nativeButton={false}
              className="ms-2"
              render={<Link href={dashboardRoutes.home()} />}
            >
              <LayoutDashboardIcon data-icon="inline-start" />
              {t("nav.dashboard")}
            </Button>
          </div>
        </div>
      </header>

      <main id="main" className="flex flex-1 flex-col">
        {children}
      </main>

      <footer className="border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex flex-col gap-2">
            {brandLink}
            <p className="text-sm text-muted-foreground">
              {t("footer.license")}
            </p>
          </div>
          <nav aria-label={t("footer.label")}>
            <ul className="-mx-3 flex flex-wrap items-center gap-y-1">
              {navItems.map(({ key, href }) => (
                <li key={key}>
                  <Link href={href} className={navLinkClassName}>
                    {t(`nav.${key}`)}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={dashboardRoutes.home()}
                  className={navLinkClassName}
                >
                  {t("nav.dashboard")}
                </Link>
              </li>
              <li>
                <a
                  href={siteLinks.github}
                  target="_blank"
                  rel="noreferrer"
                  className={cn(
                    navLinkClassName,
                    "inline-flex items-center gap-1"
                  )}
                >
                  {t("nav.github")}
                  <ArrowUpRightIcon
                    aria-hidden
                    className="size-3.5 rtl:-scale-x-100"
                  />
                  <span className="sr-only"> {newTabLabel}</span>
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  )
}
