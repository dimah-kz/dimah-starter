# SEO

Read when you add a public page or change metadata, the sitemap, robots rules or share images. Next.js reference: `01-app/01-getting-started/14-metadata-and-og-images.md` and `01-app/03-api-reference/03-file-conventions/01-metadata/` in the bundled docs ([nextjs.md](./nextjs.md)).

Public origin = `appOrigin()` from `@repo/auth/app-origin` (`BETTER_AUTH_URL`). Canonicals, the sitemap, robots, and share images all read it — set it to the production URL.

## Where it lives

| Concern                                                            | File (`apps/web/src/`)                                             |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Site defaults (base URL, title template, OG, robots, verification) | `app/layout.tsx` `generateMetadata` + `viewport`                   |
| Indexable URLs                                                     | `app/sitemap.ts`                                                   |
| Crawl rules                                                        | `app/robots.ts` (disallows `/dashboard`, `/api/`)                  |
| Share image / touch icon / manifest                                | `app/opengraph-image.tsx`, `app/apple-icon.tsx`, `app/manifest.ts` |
| Image renderer, share card, font                                   | `components/og/` ([Share images](#share-images))                   |
| Structured data (`WebSite`, `SoftwareSourceCode`, `FAQPage`)       | JSON-LD `<script>` in `app/(marketing)/page.tsx`                   |
| Summary for AI assistants                                          | `app/(marketing)/llms.txt/route.ts` (static `/llms.txt`)           |
| Project links, author                                              | `lib/site.ts`                                                      |
| Public pages shell (header, footer)                                | `app/(marketing)/layout.tsx`                                       |

## Add a public page

1. Put it under `app/(marketing)/` (shares the header and footer).
2. `generateMetadata` → `title`, `description` (from `@repo/i18n` `marketing`), `alternates: { canonical: "/path" }`.
3. Add the URL to `sitemap.ts` and, if it is navigation, to the header/footer links.

Do **not** set `openGraph` / `twitter` objects per page: Next derives their title and description from `title` / `description`, and a page-level object replaces the root one (dropping the share image). Add an `opengraph-image.tsx` beside the page only when it needs its own image.

## Share images

Generated images render with [Takumi](https://takumi.kane.tw) through `renderImage` in `apps/web/src/components/og/render-image.ts`. It lays out Persian and mixed-direction text correctly; `next/og` reverses Persian word order, so ESLint blocks `next/og` and direct `takumi-js` imports everywhere else.

- **`OgCard`** (`og-card.tsx`) is the 1200×630 card: brand, title, description, tags and the site host. It reads right to left for an RTL locale and clamps the title and description at three lines each. `OgAccent` is the gradient text of the landing page headline.
- **Font:** Vazirmatn (variable, `fonts/`, SIL OFL) is always loaded and covers Persian, Arabic and Latin at any `fontWeight`. A locale in another script needs its own font file passed in `fonts`; Takumi draws no glyph for a character no font has and does not fail.
- **Colors** live at the top of `og-card.tsx`. Images can't read CSS variables, so change them with `globals.css` when you rebrand.
- **Render inside `'use cache'`.** Takumi renders on a native thread, which Cache Components counts as request-time work. A cached function lets the build prerender the image; without it the route renders on every request.

A page with its own image puts `opengraph-image.tsx` beside its `page.tsx`:

```tsx
import { cacheLife } from "next/cache"
import { createTranslator } from "next-intl"
import { OgCard } from "@/components/og/og-card"
import { renderImage } from "@/components/og/render-image"
import { defaultLocale, loadMessages } from "@repo/i18n"

const locale = defaultLocale
const t = createTranslator({
  locale,
  messages: loadMessages(locale),
  namespace: "marketing.pricing",
})

export const alt = t("metaTitle")
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function Image() {
  return new Response(await renderPricingImage(), {
    headers: { "Content-Type": contentType },
  })
}

async function renderPricingImage() {
  "use cache"
  cacheLife("max")

  return renderImage(
    <OgCard locale={locale} title={t("title")} description={t("lede")} />,
    size
  )
}
```

For a dynamic segment, `await params` in `Image` and pass the id to the cached function. Data that changes gets a `cacheTag` from the segment's `cache-tags.ts`, which the write's action expires.

More layouts: [ogimagecn](https://www.ogimagecn.com) blocks are plain JSX. `pnpm dlx shadcn@latest add @ogimagecn/<name>` in `apps/web` puts them in `components/og/`, and `renderImage` renders them with Vazirmatn. They are designed left to right with fixed colors, so adjust both.

`opengraph-image.test.ts` checks that the share image matches the `size` and `contentType` it declares, and `og-card.test.ts` renders the card in every locale.

## Keep out of search

- One-time or private pages: `robots: { index: false }` in their `generateMetadata` (see forgot/reset password, verify email, invitations).
- App surfaces: `metadata.robots` on the segment layout (`dashboard/layout.tsx`) and a `disallow` in `robots.ts`.

## Go live

1. `BETTER_AUTH_URL=https://your-domain` at build and runtime.
2. Optional `GOOGLE_SITE_VERIFICATION` → `<meta name="google-site-verification">`.
3. Search Console: verify, then submit `https://your-domain/sitemap.xml`.
4. Rebrand `llms.txt` and the FAQ with your product's own facts — they describe this starter. The share card takes its copy from the messages; its colors are in `og-card.tsx`.
5. Install dependencies on the platform you deploy to, as Vercel and Docker builds do. Takumi's native binary is per OS, so `node_modules` copied from macOS or Windows lacks the Linux one.
6. Check share cards and structured data: [Rich Results Test](https://search.google.com/test/rich-results), [Schema validator](https://validator.schema.org/).

Crawlers send no locale cookie, so they index the default locale (`en`). Locale lives in a cookie, not the URL, so there are no `hreflang` alternates.
