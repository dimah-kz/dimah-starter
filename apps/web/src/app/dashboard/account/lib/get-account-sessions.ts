import { dashboardAuthHeaders } from "@/app/dashboard/lib/dashboard-session"
import { getLocale, getTranslations } from "next-intl/server"
import {
  dateTimeOptions,
  formatDate,
  formatRelativeTime,
  resolveLocale,
} from "@repo/i18n"
import { auth } from "@repo/auth"

export type AccountSessionDeviceKind =
  "desktop" | "mobile" | "tablet" | "unknown"

export type AccountSession = {
  id: string
  isCurrent: boolean
  kind: AccountSessionDeviceKind
  title: string
  summary: string
  signedInTitle: string
}

const BROWSER_PATTERNS: Array<[RegExp, string]> = [
  [/Edg(?:e|A|iOS)?/i, "Edge"],
  [/OPR/i, "Opera"],
  [/SamsungBrowser/i, "Samsung Internet"],
  [/CriOS|Chrome/i, "Chrome"],
  [/FxiOS|Firefox/i, "Firefox"],
  [/Safari/i, "Safari"],
]

const OS_PATTERNS: Array<[RegExp, string]> = [
  [/iPhone|iPad|iPod/i, "iOS"],
  [/Android/i, "Android"],
  [/Windows NT/i, "Windows"],
  [/Mac OS X|Macintosh/i, "macOS"],
  [/CrOS/i, "Chrome OS"],
  [/Linux/i, "Linux"],
]

export async function getAccountSessions(
  currentSessionId: string
): Promise<AccountSession[]> {
  const requestHeaders = await dashboardAuthHeaders()
  const [sessions, localeValue, t] = await Promise.all([
    auth.api.listSessions({ headers: requestHeaders }),
    getLocale(),
    getTranslations("account.sessions"),
  ])

  if (!Array.isArray(sessions)) {
    return []
  }

  const locale = resolveLocale(localeValue)
  const labels = {
    unknownDevice: t("unknownDevice"),
    deviceOnOs: (browser: string, os: string) =>
      t("deviceOnOs", { browser, os }),
  }

  return [...sessions]
    .sort((left, right) => {
      const leftCurrent = left.id === currentSessionId
      const rightCurrent = right.id === currentSessionId
      if (leftCurrent !== rightCurrent) {
        return leftCurrent ? -1 : 1
      }

      return (
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      )
    })
    .map((session) => {
      const createdAt = new Date(session.createdAt)
      const device = parseSessionUserAgent(session.userAgent ?? null)
      const signedIn = formatRelativeTime(createdAt, locale)
      const expires = formatRelativeTime(session.expiresAt, locale)
      const ip = sessionIpLabel(session.ipAddress ?? null)

      return {
        id: session.id,
        isCurrent: session.id === currentSessionId,
        kind: device.kind,
        title: sessionDeviceTitle(device, labels),
        summary: ip
          ? t("summaryWithIp", { signedIn, expires, ip })
          : t("summary", { signedIn, expires }),
        signedInTitle: formatDate(createdAt, locale, dateTimeOptions),
      }
    })
}

function parseSessionUserAgent(userAgent: string | null): {
  kind: AccountSessionDeviceKind
  browser: string | null
  os: string | null
} {
  if (!userAgent?.trim()) {
    return { kind: "unknown", browser: null, os: null }
  }

  return {
    kind: parseDeviceKind(userAgent),
    browser: matchPattern(userAgent, BROWSER_PATTERNS),
    os: matchPattern(userAgent, OS_PATTERNS),
  }
}

function parseDeviceKind(userAgent: string): AccountSessionDeviceKind {
  if (
    /iPad|Tablet|PlayBook|Silk/i.test(userAgent) ||
    (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent))
  ) {
    return "tablet"
  }

  if (/Mobi|iPhone|iPod|Android.*Mobile|webOS|BlackBerry/i.test(userAgent)) {
    return "mobile"
  }

  return "desktop"
}

function matchPattern(value: string, patterns: Array<[RegExp, string]>) {
  for (const [pattern, name] of patterns) {
    if (pattern.test(value)) {
      return name
    }
  }

  return null
}

function sessionDeviceTitle(
  device: { browser: string | null; os: string | null },
  labels: {
    unknownDevice: string
    deviceOnOs: (browser: string, os: string) => string
  }
) {
  if (device.browser && device.os) {
    return labels.deviceOnOs(device.browser, device.os)
  }

  return device.browser ?? device.os ?? labels.unknownDevice
}

function sessionIpLabel(ipAddress: string | null) {
  const ip = ipAddress?.trim()
  if (!ip || isLoopbackOrUnspecifiedIp(ip)) {
    return null
  }

  return ip
}

function isLoopbackOrUnspecifiedIp(ip: string) {
  if (ip.includes(".")) {
    return ip === "127.0.0.1" || ip.endsWith("127.0.0.1")
  }

  if (!ip.includes(":")) {
    return false
  }

  const values = ip
    .split(":")
    .filter((group) => group.length > 0)
    .map((group) => Number.parseInt(group, 16))

  if (values.some((value) => Number.isNaN(value))) {
    return false
  }

  const nonzero = values.filter((value) => value !== 0)
  return nonzero.length === 0 || (nonzero.length === 1 && nonzero[0] === 1)
}
