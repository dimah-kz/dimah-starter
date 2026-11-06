import {
  dateTimeOptions,
  formatDate,
  loadMessages,
  type Locale,
} from "@repo/i18n"

export function fill(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? values[key]! : match
  )
}

export function emailMessages(locale: Locale) {
  return loadMessages(locale).email
}

export function appName(locale: Locale) {
  return loadMessages(locale).common.appTitle
}

/**
 * Labels for a Better Auth role string (`"admin,member"`). Split locally:
 * `parseRoleString` lives in `@repo/auth`, which already depends on this package.
 */
export function membershipRoleLabel(locale: Locale, role: string) {
  const labels = loadMessages(locale).badges.membershipRole as Record<
    string,
    string
  >
  const tokens = role
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean)

  return new Intl.ListFormat(locale, { type: "conjunction" }).format(
    tokens.map((token) => labels[token] ?? token)
  )
}

export function formatEmailDate(value: Date | string, locale: Locale) {
  return formatDate(value, locale, dateTimeOptions)
}
