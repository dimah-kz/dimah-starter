import {
  dateTimeOptions,
  formatDate,
  getLocaleDirection,
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

export function emailDirection(locale: Locale) {
  return getLocaleDirection(locale)
}

export function membershipRoleLabel(locale: Locale, role: string) {
  const labels = loadMessages(locale).badges.membershipRole as Record<
    string,
    string
  >
  const separator = locale === "fa" ? "، " : ", "

  return role
    .split(",")
    .map((token) => token.trim())
    .filter(Boolean)
    .map((token) => labels[token] ?? token)
    .join(separator)
}

export function formatEmailDate(value: Date | string, locale: Locale) {
  return formatDate(value, locale, dateTimeOptions)
}
