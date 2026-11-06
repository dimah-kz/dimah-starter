# SEO

> Next metadata docs: `apps/web/node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md` and `03-api-reference/03-file-conventions/01-metadata/`

Public origin = `appOrigin()` from `@repo/auth/app-origin` (`BETTER_AUTH_URL`). Canonicals, the sitemap, robots, and share images all read it — set it to the production URL.

## Where it lives

| Concern                                                            | File (`apps/web/src/`)                                             |
| ------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Site defaults (base URL, title template, OG, robots, verification) | `app/layout.tsx` `generateMetadata` + `viewport`                   |
| Indexable URLs                                                     | `app/sitemap.ts`                                                   |
| Crawl rules                                                        | `app/robots.ts` (disallows `/dashboard`, `/api/`)                  |
| Share image / touch icon / manifest                                | `app/opengraph-image.tsx`, `app/apple-icon.tsx`, `app/manifest.ts` |
| Structured data                                                    | JSON-LD `<script>` in `app/(marketing)/page.tsx`                   |
| Project links, author                                              | `lib/site.ts`                                                      |
| Public pages shell (header, footer)                                | `app/(marketing)/layout.tsx`                                       |

## Add a public page

1. Put it under `app/(marketing)/` (shares the header and footer).
2. `generateMetadata` → `title`, `description` (from `@repo/i18n` `marketing`), `alternates: { canonical: "/path" }`.
3. Add the URL to `sitemap.ts` and, if it is navigation, to the header/footer links.

Do **not** set `openGraph` / `twitter` objects per page: Next derives their title and description from `title` / `description`, and a page-level object replaces the root one (dropping the share image). Add an `opengraph-image.tsx` beside the page only when it needs its own image.

## Keep out of search

- One-time or private pages: `robots: { index: false }` in their `generateMetadata` (see forgot/reset password, verify email, invitations).
- App surfaces: `metadata.robots` on the segment layout (`dashboard/layout.tsx`) and a `disallow` in `robots.ts`.

## Go live

1. `BETTER_AUTH_URL=https://your-domain` at build and runtime.
2. Optional `GOOGLE_SITE_VERIFICATION` → `<meta name="google-site-verification">`.
3. Search Console: verify, then submit `https://your-domain/sitemap.xml`.
4. Check share cards and structured data: [Rich Results Test](https://search.google.com/test/rich-results), [Schema validator](https://validator.schema.org/).

Crawlers send no locale cookie, so they index the default locale (`en`). Locale lives in a cookie, not the URL, so there are no `hreflang` alternates.
