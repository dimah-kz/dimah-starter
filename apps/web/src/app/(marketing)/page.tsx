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
import { siteAuthor, siteLinks } from "@/lib/site"
import { appOrigin } from "@repo/auth/app-origin"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion"
import { Badge } from "@repo/ui/components/badge"
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
  DatabaseZapIcon,
  FileCodeIcon,
  KeyRoundIcon,
  LanguagesIcon,
  LockKeyholeIcon,
  RefreshCwIcon,
  ServerIcon,
  ShieldIcon,
  TerminalIcon,
  ZapIcon,
} from "lucide-react"

const features = [
  { key: "auth", icon: KeyRoundIcon },
  { key: "organizations", icon: Building2Icon },
  { key: "admin", icon: ShieldIcon },
  { key: "storage", icon: CloudUploadIcon },
  { key: "i18n", icon: LanguagesIcon },
  { key: "serverFirst", icon: ServerIcon },
] as const

const faqKeys = [
  "free",
  "serverFirst",
  "deploy",
  "customize",
  "aiAgents",
  "missing",
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

const nextjsPoints = [
  { key: "prefetch", icon: ZapIcon },
  { key: "cache", icon: DatabaseZapIcon },
  { key: "update", icon: RefreshCwIcon },
  { key: "secure", icon: LockKeyholeIcon },
] as const

/** Trimmed from `get-organization-members-page.ts` and its remove action. */
const cacheExample = `// Read — a gate per request, then a tagged cache entry
export async function getOrganizationMembersPage(query) {
  const { organizationId } = await requireOrganizationManager()
  return getCachedPage(organizationId, query)
}

async function getCachedPage(organizationId, query) {
  "use cache"
  cacheLife("minutes")
  cacheTag(tags.organizationMembersById(organizationId))
  return db.select().from(member) // …
}

// Write — a Server Action; fresh UI in the same response
export async function removeOrganizationMemberAction(input) {
  await auth.api.removeMember({ headers: await headers(), body })
  updateTag(tags.organizationMembersById(input.organizationId))
}`

const quickStartCommands = [
  "pnpm install",
  "cp .env.example .env",
  "pnpm --filter @repo/db db:migrate",
  "pnpm dev",
].join("\n")

/** Large CTA on top of `size="lg"`; keeps icon-side padding in step with `px-4`. */
const ctaClassName =
  "h-10 gap-2 px-4 text-sm has-data-[icon=inline-end]:pe-3.5 has-data-[icon=inline-start]:ps-3.5"

/**
 * Title, description, and canonical only: Next derives the og/twitter title and
 * description from them, and a page-level `openGraph` object would replace the
 * root one, dropping the inherited share image.
 */
export async function generateMetadata(): Promise<Metadata> {
  const [t, tc] = await Promise.all([
    getTranslations("marketing.home"),
    getTranslations("common"),
  ])

  return {
    title: { absolute: t("metaTitle") },
    description: tc("appDescription"),
    alternates: { canonical: marketingRoutes.home() },
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
        image: `${origin}/opengraph-image`,
        codeRepository: siteLinks.github,
        programmingLanguage: "TypeScript",
        runtimePlatform: "Node.js",
        keywords: stack.join(", "),
        license: siteLinks.license,
        isAccessibleForFree: true,
        author: { "@type": "Person", ...siteAuthor },
      },
      {
        "@type": "FAQPage",
        "@id": `${origin}/#faq`,
        mainEntity: faqKeys.map((key) => ({
          "@type": "Question",
          name: t(`faq.items.${key}.question`),
          acceptedAnswer: {
            "@type": "Answer",
            text: t(`faq.items.${key}.answer`),
          },
        })),
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

      <section>
        <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-4 pt-20 pb-20 text-center sm:px-6 sm:pt-28 sm:pb-24">
          <Badge
            variant="outline"
            className="h-auto gap-2 bg-background/70 px-3 py-1 text-xs text-muted-foreground"
          >
            <span
              aria-hidden
              className="size-1.5 rounded-full bg-linear-to-r from-[#FF1E56] to-[#0196FF]"
            />
            {t("eyebrow")}
          </Badge>
          <h1 className="mt-6 max-w-3xl text-4xl leading-tight font-semibold tracking-tight text-balance sm:text-6xl sm:leading-[1.1]">
            {t.rich("headline", {
              accent: (chunks) => <HeadlineAccent>{chunks}</HeadlineAccent>,
            })}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-balance text-muted-foreground sm:text-lg sm:leading-8">
            {t.rich("lede", {
              line: (chunks) => <span className="sm:block">{chunks}</span>,
            })}
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
          <p className="mt-4 text-sm text-muted-foreground">{t("demoHint")}</p>
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
              <li
                key={key}
                className="flex gap-4 bg-background p-6 sm:block sm:p-8"
              >
                <IconTile size="sm">
                  <Icon aria-hidden />
                </IconTile>
                <div className="sm:mt-5">
                  <h3 className="text-base font-medium">
                    {t(`features.items.${key}.title`)}
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-pretty text-muted-foreground sm:mt-2">
                    {t(`features.items.${key}.description`)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id={marketingSections.nextjs}
        aria-labelledby="nextjs-title"
        className="scroll-mt-14 border-t py-20 sm:py-28"
      >
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              {t("nextjs.eyebrow")}
            </p>
            <h2
              id="nextjs-title"
              className="mt-2 text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
            >
              {t("nextjs.title")}
            </h2>
            <p className="mt-4 text-base leading-7 text-pretty text-muted-foreground sm:text-lg">
              {t("nextjs.description")}
            </p>
            <ul className="mt-8 grid gap-6 sm:grid-cols-2">
              {nextjsPoints.map(({ key, icon: Icon }) => (
                <li key={key} className="flex gap-3">
                  <IconTile size="sm">
                    <Icon aria-hidden />
                  </IconTile>
                  <div>
                    <h3 className="text-sm font-medium">
                      {t(`nextjs.points.${key}.title`)}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-pretty text-muted-foreground">
                      {t(`nextjs.points.${key}.description`)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <CodeBlock className="bg-background shadow-sm">
            <CodeBlockHeader>
              <CodeBlockTitle>
                <FileCodeIcon aria-hidden />
                {t("nextjs.code")}
              </CodeBlockTitle>
            </CodeBlockHeader>
            <CodeBlockContent>{cacheExample}</CodeBlockContent>
          </CodeBlock>
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
            <CodeBlockContent lineNumbers>
              {quickStartCommands}
            </CodeBlockContent>
          </CodeBlock>
        </div>
      </section>

      <section
        id={marketingSections.faq}
        aria-labelledby="faq-title"
        className="scroll-mt-14 py-20 sm:py-28"
      >
        <div className="mx-auto w-full max-w-3xl px-4 sm:px-6">
          <div className="text-center">
            <h2
              id="faq-title"
              className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
            >
              {t("faq.title")}
            </h2>
            <p className="mt-4 text-base leading-7 text-pretty text-muted-foreground sm:text-lg">
              {t("faq.description")}
            </p>
          </div>

          {/* `hiddenUntilFound` keeps closed answers in the HTML for crawlers and find-in-page. */}
          <Accordion hiddenUntilFound className="mt-12 rounded-xl sm:mt-16">
            {faqKeys.map((key) => (
              <AccordionItem key={key} value={key}>
                <AccordionTrigger className="px-6 py-5 text-base hover:no-underline">
                  {t(`faq.items.${key}.question`)}
                </AccordionTrigger>
                <AccordionContent className="px-4 text-sm leading-6 text-pretty text-muted-foreground">
                  {t(`faq.items.${key}.answer`)}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </>
  )
}
