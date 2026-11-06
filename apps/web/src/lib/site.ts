/**
 * Public project facts for metadata, JSON-LD, and marketing links.
 * The site origin is not here: it is `appOrigin()` from `@repo/auth/app-origin`
 * (`BETTER_AUTH_URL`), so auth links, canonicals, and the sitemap agree.
 */
export const siteLinks = {
  github: "https://github.com/dimah-kz/dimah-starter",
  template: "https://github.com/dimah-kz/dimah-starter/generate",
  docs: "https://github.com/dimah-kz/dimah-starter#readme",
  license: "https://opensource.org/licenses/MIT",
} as const

export const siteAuthor = {
  name: "dimah-kz",
  url: "https://github.com/dimah-kz",
} as const
