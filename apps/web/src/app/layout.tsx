import "@repo/ui/globals.css"
import type { Metadata, Viewport } from "next"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { HtmlLocaleSync } from "@/components/locale/html-locale-sync"
import { LoadingFallbackShell } from "@/components/fallback/loading-fallback"
import { siteAuthor } from "@/lib/site"
import { appOrigin } from "@repo/auth/app-origin"
import {
  defaultLocale,
  directions,
  getLocaleDirection,
  localeCookieName,
  type Locale,
} from "@repo/i18n"
import { Vazirmatn } from "next/font/google"
import { getLocale, getMessages, getTranslations } from "next-intl/server"
import { NextIntlClientProvider } from "next-intl"
import { DirectionProvider } from "@repo/ui/components/direction"
import { Toaster } from "@repo/ui/components/toast"
import { cn } from "cn"

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin", "latin-ext"],
  variable: "--font-sans",
})

const openGraphLocales: Record<Locale, string> = {
  en: "en_US",
  fa: "fa_IR",
}

/**
 * `<html>` is static (no cookie read outside Suspense), so it ships the default
 * locale. This runs before the first paint and applies the locale cookie's
 * `lang` / `dir`, so RTL users never see an LTR flash. `HtmlLocaleSync` keeps
 * them in step after client-side locale switches.
 */
const htmlLocaleScript = `(function(){try{var d=${JSON.stringify(directions)},m=document.cookie.match(/(?:^|; )${localeCookieName}=([^;]*)/),l=m&&decodeURIComponent(m[1]);if(l&&{}.hasOwnProperty.call(d,l)){var h=document.documentElement;h.lang=l;h.dir=d[l]}}catch(e){}})()`

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

/**
 * Site-wide defaults. Pages add `title`, `description`, and
 * `alternates.canonical`; private pages set `robots: { index: false }`.
 * The share image comes from `opengraph-image.tsx`.
 */
export async function generateMetadata(): Promise<Metadata> {
  const [t, locale] = await Promise.all([
    getTranslations("common"),
    getLocale(),
  ])
  const appTitle = t("appTitle")

  return {
    metadataBase: new URL(appOrigin()),
    title: {
      default: appTitle,
      template: t("metadataTitleTemplate"),
    },
    description: t("appDescription"),
    applicationName: appTitle,
    authors: [siteAuthor],
    creator: siteAuthor.name,
    category: "technology",
    openGraph: {
      type: "website",
      siteName: appTitle,
      locale: openGraphLocales[locale],
    },
    twitter: { card: "summary_large_image" },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION?.trim() || undefined,
    },
    formatDetection: { telephone: false, email: false, address: false },
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang={defaultLocale}
      dir={getLocaleDirection(defaultLocale)}
      data-scroll-behavior="smooth"
      className={cn(
        "h-full",
        "antialiased",
        "motion-safe:scroll-smooth",
        vazirmatn.variable,
        "font-sans"
      )}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: htmlLocaleScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <ThemeProvider>
          <Suspense
            fallback={<LoadingFallbackShell className="min-h-svh flex-1" />}
          >
            <RootIntlShell>{children}</RootIntlShell>
          </Suspense>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

async function RootIntlShell({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // The provider inherits the locale from `i18n/request.ts`. Messages are passed
  // only to keep the server-only `email` namespace out of the client payload.
  const [locale, { email: _email, ...messages }] = await Promise.all([
    getLocale(),
    getMessages(),
  ])

  return (
    <DirectionProvider direction={getLocaleDirection(locale)}>
      <NextIntlClientProvider messages={messages}>
        <HtmlLocaleSync />
        {children}
      </NextIntlClientProvider>
    </DirectionProvider>
  )
}
