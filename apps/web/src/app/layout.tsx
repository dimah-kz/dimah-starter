import "@repo/ui/globals.css"
import type { Metadata } from "next"
import { Suspense } from "react"
import { ThemeProvider } from "@/components/theme/theme-provider"
import { HtmlLocaleSync } from "@/components/locale/html-locale-sync"
import { LoadingFallbackShell } from "@/components/fallback/loading-fallback"
import { defaultLocale, getLocaleDirection } from "@repo/i18n"
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

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common")

  return {
    title: {
      default: t("appTitle"),
      template: t("metadataTitleTemplate"),
    },
    description: t("appDescription"),
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
      className={cn("h-full", "antialiased", vazirmatn.variable, "font-sans")}
      suppressHydrationWarning
    >
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
  const locale = await getLocale()
  const messages = await getMessages()
  const direction = getLocaleDirection(locale)

  return (
    <DirectionProvider direction={direction}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <HtmlLocaleSync />
        {children}
      </NextIntlClientProvider>
    </DirectionProvider>
  )
}
