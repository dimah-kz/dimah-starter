import Link from "next/link"
import { getTranslations } from "next-intl/server"
import type { ReactNode } from "react"
import { AuthSettingsMenu } from "@/app/(auth)/components/auth-settings-menu"
import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"
import { BrandMark } from "@/components/brand-mark"
import { Button } from "@repo/ui/components/button"
import { ArrowRight, ArrowUpRight } from "lucide-react"

const githubUrl = "https://github.com/dimah-kz/dimah-starter"
const nextUrl = "https://nextjs.org"
const betterAuthUrl = "https://www.better-auth.com"
const storageUrl = "https://dimah-s3.vercel.app"

const featureKeys = ["server", "writes", "chrome"] as const

const ctaClassName = "h-10 gap-2 px-4 text-sm"

function GitHubIcon() {
  return (
    <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" className="size-4">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  )
}

function HeadlineAccent({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block bg-linear-to-r from-[#FF1E56] to-[#0196FF] bg-clip-text pe-1 text-transparent">
      {children}
    </span>
  )
}

function ProductLink({
  href,
  newTabLabel,
  children,
}: {
  href: string
  newTabLabel: string
  children: ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="underline decoration-foreground/25 underline-offset-4 transition-colors hover:decoration-foreground"
    >
      {children}
      <span className="sr-only"> {newTabLabel}</span>
    </a>
  )
}

export default async function Home() {
  const t = await getTranslations("common")
  const tDashboard = await getTranslations("dashboard")
  const newTabLabel = t("home.opensInNewTab")

  return (
    <div className="relative flex min-h-svh flex-1 flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-128 bg-[radial-gradient(ellipse_at_top,color-mix(in_oklab,var(--foreground)_7%,transparent),transparent_70%)]"
      />

      <header className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-6 py-5">
        <Link
          href="/"
          className="inline-flex min-w-0 items-center gap-2.5 rounded-md text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <BrandMark className="size-7" />
          <span className="truncate text-sm font-semibold tracking-[-0.02em]">
            {t("appTitle")}
          </span>
        </Link>
        <AuthSettingsMenu
          showHome={false}
          className="bg-transparent backdrop-blur-none"
        />
      </header>

      <section
        aria-labelledby="hero-heading"
        className="mx-auto flex w-full max-w-5xl flex-1 flex-col justify-center-safe px-6 py-16 sm:py-20"
      >
        <div className="grid w-full gap-14 lg:grid-cols-[max-content_minmax(0,1fr)] lg:items-start lg:gap-x-20">
          <div className="max-w-lg">
            <h1
              id="hero-heading"
              className="text-[2.75rem] leading-[1.05] font-medium tracking-[-0.03em] sm:text-6xl lg:text-[4.15rem]"
            >
              {t.rich("home.headline", {
                line: (chunks) => <span className="block">{chunks}</span>,
                accent: (chunks) => <HeadlineAccent>{chunks}</HeadlineAccent>,
              })}
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-pretty text-muted-foreground">
              {t.rich("home.lede", {
                next: (chunks) => (
                  <ProductLink href={nextUrl} newTabLabel={newTabLabel}>
                    {chunks}
                  </ProductLink>
                ),
                auth: (chunks) => (
                  <ProductLink href={betterAuthUrl} newTabLabel={newTabLabel}>
                    {chunks}
                  </ProductLink>
                ),
                storage: (chunks) => (
                  <ProductLink href={storageUrl} newTabLabel={newTabLabel}>
                    {chunks}
                  </ProductLink>
                ),
              })}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-2.5">
              <Button
                nativeButton={false}
                className={ctaClassName}
                render={<Link href={dashboardRoutes.home()} />}
              >
                {tDashboard("nav.sidebar.dashboard")}
                <ArrowRight
                  aria-hidden
                  strokeWidth={1.75}
                  className="size-4 transition-transform duration-200 group-hover/button:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover/button:-translate-x-0.5"
                />
              </Button>
              <Button
                variant="outline"
                nativeButton={false}
                className={ctaClassName}
                render={<a href={githubUrl} target="_blank" rel="noreferrer" />}
              >
                <GitHubIcon />
                {t("home.viewOnGitHub")}
                <ArrowUpRight
                  aria-hidden
                  strokeWidth={1.75}
                  className="size-3.5 text-muted-foreground transition-transform duration-200 group-hover/button:translate-x-px group-hover/button:-translate-y-px rtl:-scale-x-100 rtl:group-hover/button:-translate-x-px"
                />
                <span className="sr-only">{newTabLabel}</span>
              </Button>
            </div>
          </div>

          <ul className="divide-y divide-border border-t border-border lg:border-s lg:border-t-0 lg:ps-14">
            {featureKeys.map((key, index) => (
              <li
                key={key}
                className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-4 py-5 first:pt-6 last:pb-0 lg:py-6 lg:first:pt-0"
              >
                <span
                  aria-hidden
                  className="pt-1 font-mono text-[11px] tracking-[0.16em] text-muted-foreground tabular-nums"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h2 className="text-[15px] font-medium tracking-[-0.02em]">
                    {t(`home.features.${key}.title`)}
                  </h2>
                  <p className="mt-1.5 max-w-md text-sm leading-6 text-pretty text-muted-foreground">
                    {t(`home.features.${key}.description`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-3 px-6 py-5 text-[13px] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>{t("home.license")}</p>
          <nav
            aria-label={t("home.footerNav")}
            className="flex items-center gap-5"
          >
            <Link
              href={dashboardRoutes.home()}
              className="transition-colors hover:text-foreground"
            >
              {tDashboard("nav.sidebar.dashboard")}
            </Link>
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="transition-colors hover:text-foreground"
            >
              {t("home.github")}
              <span className="sr-only"> {newTabLabel}</span>
            </a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
