import { cacheLife } from "next/cache"
import { createTranslator } from "next-intl"
import { OgAccent, OgCard } from "@/components/og/og-card"
import { renderImage } from "@/components/og/render-image"
import { defaultLocale, getLocaleDirection, loadMessages } from "@repo/i18n"

/** Share image for every route. Crawlers send no locale cookie, so it uses the default locale. */
const locale = defaultLocale
const messages = loadMessages(locale)
const t = createTranslator({ locale, messages, namespace: "marketing.home" })

export const alt = t("metaTitle")
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const stack = ["Next.js", "Better Auth", "Postgres", "i18n + RTL"]

export default async function OpengraphImage() {
  return new Response(await renderShareImage(), {
    headers: { "Content-Type": contentType },
  })
}

// Cached, so the build prerenders it. Its copy changes only with a deploy.
async function renderShareImage() {
  "use cache"
  cacheLife("max")

  const dir = getLocaleDirection(locale)

  return renderImage(
    <OgCard
      locale={locale}
      title={t.rich("headline", {
        accent: (chunks) => <OgAccent dir={dir}>{chunks}</OgAccent>,
      })}
      description={messages.common.appDescription}
      tags={stack}
    />,
    size
  )
}
