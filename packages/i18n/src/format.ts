import type { Locale } from "./config"

export const dateTimeOptions: Intl.DateTimeFormatOptions = {
  dateStyle: "medium",
  timeStyle: "short",
}

export function formatDate(
  value: string | number | Date,
  locale: Locale,
  options: Intl.DateTimeFormatOptions = { dateStyle: "medium" }
) {
  return new Intl.DateTimeFormat(locale, options).format(new Date(value))
}

const relativeTimeDivisions: {
  amount: number
  unit: Intl.RelativeTimeFormatUnit
}[] = [
  { amount: 60, unit: "second" },
  { amount: 60, unit: "minute" },
  { amount: 24, unit: "hour" },
  { amount: 7, unit: "day" },
  { amount: 4.34524, unit: "week" },
  { amount: 12, unit: "month" },
  { amount: Number.POSITIVE_INFINITY, unit: "year" },
]

export function formatRelativeTime(
  value: string | number | Date,
  locale: Locale
) {
  let duration = (new Date(value).getTime() - Date.now()) / 1000
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: "auto" })

  for (const division of relativeTimeDivisions) {
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.unit)
    }

    duration /= division.amount
  }

  return formatter.format(0, "second")
}

export function formatNumber(
  value: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions
) {
  return new Intl.NumberFormat(locale, options).format(value)
}
