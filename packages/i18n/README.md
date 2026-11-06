# @repo/i18n

Shared locale config, message catalogs, and formatting helpers (`en` / `fa` today).

Product copy lives here so every app speaks the same language — add or edit strings under `src/messages/`, not hardcoded in UI or Server Actions. Locale is cookie-based (`NEXT_LOCALE`, `localeCookieName`); Next.js wires catalogs through `next-intl`.
