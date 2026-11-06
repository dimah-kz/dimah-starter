import type { Metadata } from "next"
import Link from "next/link"
import { getLocale, getTranslations } from "next-intl/server"
import type { ReactNode } from "react"
import { GitHubIcon } from "@/app/(marketing)/components/github-icon"
import {
  marketingRoutes,
  marketingSections,
} from "@/app/(marketing)/lib/marketing-routes"
import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"
import { openGraphLocales, siteAuthor, siteLinks } from "@/lib/site"
import { appOrigin } from "@repo/auth/app-origin"
import { Button } from "@repo/ui/components/button"
import {
  CodeBlock,
  CodeBlockActions,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockHeader,
  CodeBlockTitle,
} from "@repo/ui/components/code-block"
import { IconTile } from "@repo/ui/components/reui/icon-tile"
import {
  ArrowRightIcon,
  BookOpenIcon,
  Building2Icon,
  CloudUploadIcon,
  KeyRoundIcon,
  LanguagesIcon,
  ServerIcon,
  ShieldIcon,
  TerminalIcon,
} from "lucide-react"

const features = [
  { key: "auth", icon: KeyRoundIcon },
  { key: "organizations", icon: Building2Icon },
  { key: "admin", icon: ShieldIcon },
  { key: "storage", icon: CloudUploadIcon },
  { key: "i18n", icon: LanguagesIcon },
  { key: "serverFirst", icon: ServerIcon },
] as const

const stack = [
  "Next.js 16",
  "React 19",
  "Better Auth",
  "Drizzle ORM",
  "PostgreSQL",
  "shadcn/ui",
  "Turborepo",
] as const

const quickStartCommands = [
  "pnpm install",
  "cp .env.example .env",
  "pnpm --filter @repo/db db:migrate",
  "pnpm dev",
].join("\n")

/** Large CTA on top of `size="lg"`; keeps icon-side padding in step with `px-4`. */
const ctaClassName =
  "h-10 gap-2 px-4 text-sm has-data-[icon=inline-end]:pe-3.5 has-data-[icon=inline-start]:ps-3.5"

export async function generateMetadata(): Promise<Metadata> {
  const [t, tc, locale] = await Promise.all([
    getTranslations("marketing.home"),
    getTranslations("common"),
    getLocale(),
  ])
  const title = t("metaTitle")
  const description = tc("appDescription")

  return {
    title: { absolute: title },
    description,
    alternates: { canonical: marketingRoutes.home() },
    openGraph: {
      type: "website",
      url: marketingRoutes.home(),
      siteName: tc("appTitle"),
      locale: openGraphLocales[locale],
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
  }
}

function HeadlineAccent({ children }: { children: ReactNode }) {
  return (
    <span className="bg-linear-to-r from-[#FF1E56] to-[#0196FF] bg-clip-text pe-1 text-transparent rtl:bg-linear-to-l">
      {children}
    </span>
  )
}

export default async function Home() {
  const [t, tm, tc, locale] = await Promise.all([
    getTranslations("marketing.home"),
    getTranslations("marketing"),
    getTranslations("common"),
    getLocale(),
  ])
  const newTabLabel = tm("opensInNewTab")
  const origin = appOrigin()

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        url: `${origin}/`,
        name: tc("appTitle"),
        description: tc("appDescription"),
        inLanguage: locale,
      },
      {
        "@type": "SoftwareSourceCode",
        "@id": `${origin}/#software`,
        name: tc("appTitle"),
        description: tc("appDescription"),
        url: `${origin}/`,
        codeRepository: siteLinks.github,
        programmingLanguage: "TypeScript",
        runtimePlatform: "Node.js",
        license: siteLinks.license,
        author: { "@type": "Person", ...siteAuthor },
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black_20%,transparent_100%)] [background-size:3.5rem_3.5rem] opacity-60"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-32 -z-10 mx-auto h-72 max-w-3xl rounded-full bg-linear-to-r from-[#FF1E56]/15 to-[#0196FF]/15 blur-3xl"
        />

        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-20 pb-20 text-center sm:px-6 sm:pt-28 sm:pb-24">
          <p className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground">
            <span
              aria-hidden
              className="size-1.5 rounded-full bg-linear-to-r from-[#FF1E56] to-[#0196FF]"
            />
            {t("eyebrow")}
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-6xl sm:leading-[1.1]">
            {t.rich("headline", {
              accent: (chunks) => <HeadlineAccent>{chunks}</HeadlineAccent>,
            })}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-balance text-muted-foreground sm:text-lg sm:leading-8">
            {t("lede")}
          </p>

          <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button
              size="lg"
              nativeButton={false}
              className={ctaClassName}
              render={<Link href={dashboardRoutes.home()} />}
            >
              {t("tryDemo")}
              <ArrowRightIcon
                data-icon="inline-end"
                className="transition-transform duration-200 group-hover/button:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover/button:-translate-x-0.5"
              />
            </Button>
            <Button
              variant="outline"
              size="lg"
              nativeButton={false}
              className={ctaClassName}
              render={
                <a href={siteLinks.template} target="_blank" rel="noreferrer" />
              }
            >
              <GitHubIcon data-icon="inline-start" />
              {t("useTemplate")}
              <span className="sr-only"> {newTabLabel}</span>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            {t("demoHint")}
          </p>
        </div>
      </section>

      <div className="border-y bg-muted/30">
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-3 px-4 py-6 sm:flex-row sm:justify-center sm:gap-6 sm:px-6">
          <p className="shrink-0 text-xs font-medium text-muted-foreground">
            {t("builtWith")}
          </p>
          <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium text-foreground/80">
            {stack.map((name) => (
              <li key={name}>{name}</li>
            ))}
          </ul>
        </div>
      </div>

      <section
        id={marketingSections.features}
        aria-labelledby="features-title"
        className="scroll-mt-14 py-20 sm:py-28"
      >
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2
              id="features-title"
              className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
            >
              {t("features.title")}
            </h2>
            <p className="mt-4 text-base leading-7 text-pretty text-muted-foreground sm:text-lg">
              {t("features.description")}
            </p>
          </div>

          <ul className="mt-12 grid gap-px overflow-hidden rounded-xl border bg-border sm:mt-16 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ key, icon: Icon }) => (
              <li key={key} className="bg-background p-6 sm:p-8">
                <IconTile size="sm">
                  <Icon aria-hidden />
                </IconTile>
                <h3 className="mt-5 text-base font-medium">
                  {t(`features.items.${key}.title`)}
                </h3>
                <p className="mt-2 text-sm leading-6 text-pretty text-muted-foreground">
                  {t(`features.items.${key}.description`)}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id={marketingSections.quickStart}
        aria-labelledby="quick-start-title"
        className="scroll-mt-14 border-t bg-muted/30 py-20 sm:py-28"
      >
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <div className="text-center lg:text-start">
            <h2
              id="quick-start-title"
              className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
            >
              {t("quickStart.title")}
            </h2>
            <p className="mt-4 text-base leading-7 text-pretty text-muted-foreground sm:text-lg">
              {t("quickStart.description")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <Button
                size="lg"
                nativeButton={false}
                className={ctaClassName}
                render={
                  <a
                    href={siteLinks.template}
                    target="_blank"
                    rel="noreferrer"
                  />
                }
              >
                <GitHubIcon data-icon="inline-start" />
                {t("useTemplate")}
                <span className="sr-only"> {newTabLabel}</span>
              </Button>
              <Button
                variant="outline"
                size="lg"
                nativeButton={false}
                className={ctaClassName}
                render={
                  <a href={siteLinks.docs} target="_blank" rel="noreferrer" />
                }
              >
                <BookOpenIcon data-icon="inline-start" />
                {t("quickStart.readDocs")}
                <span className="sr-only"> {newTabLabel}</span>
              </Button>
            </div>
          </div>

          <CodeBlock className="bg-background shadow-sm">
            <CodeBlockHeader>
              <CodeBlockTitle>
                <TerminalIcon aria-hidden />
                {t("quickStart.terminal")}
              </CodeBlockTitle>
              <CodeBlockActions>
                <CodeBlockCopyButton
                  value={quickStartCommands}
                  aria-label={t("quickStart.copy")}
                />
              </CodeBlockActions>
            </CodeBlockHeader>
            <CodeBlockContent lineNumbers>{quickStartCommands}</CodeBlockContent>
          </CodeBlock>
        </div>
      </section>
    </>
  )
}
