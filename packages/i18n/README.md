# @repo/i18n

Locale config, message catalogs and formatters for every app (`en` and `fa`, right-to-left included).

- **Messages** — `src/messages/<locale>/<namespace>.json`. Product copy lives here, never hardcoded in UI or Server Actions. Every locale has the same keys and the same `{placeholders}`; `src/load-messages.test.ts` fails otherwise.
- **Locale** — read from the `NEXT_LOCALE` cookie (`localeCookieName`), no URL prefix. `resolveLocaleFromHeaders` reads it outside Next (Better Auth mail).
- **Formatting** — `formatDate`, `formatNumber`, `formatRelativeTime` over `Intl`.

The web app wires the catalogs through `next-intl` in `apps/web/src/i18n/`. Adding or removing a locale: [docs/agents/i18n.md](../../docs/agents/i18n.md).
