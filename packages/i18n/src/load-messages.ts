import type { Locale } from "./config"

import enAccount from "./messages/en/account.json"
import enAuth from "./messages/en/auth.json"
import enBadges from "./messages/en/badges.json"
import enCommon from "./messages/en/common.json"
import enDashboard from "./messages/en/dashboard.json"
import enEmail from "./messages/en/email.json"
import enTables from "./messages/en/tables.json"

import faAccount from "./messages/fa/account.json"
import faAuth from "./messages/fa/auth.json"
import faBadges from "./messages/fa/badges.json"
import faCommon from "./messages/fa/common.json"
import faDashboard from "./messages/fa/dashboard.json"
import faEmail from "./messages/fa/email.json"
import faTables from "./messages/fa/tables.json"

export type MessageNamespace =
  "common" | "auth" | "dashboard" | "account" | "badges" | "tables" | "email"

export type Messages = {
  common: typeof enCommon
  auth: typeof enAuth
  dashboard: typeof enDashboard
  account: typeof enAccount
  badges: typeof enBadges
  tables: typeof enTables
  email: typeof enEmail
}

const catalogs: Record<Locale, Messages> = {
  en: {
    common: enCommon,
    auth: enAuth,
    dashboard: enDashboard,
    account: enAccount,
    badges: enBadges,
    tables: enTables,
    email: enEmail,
  },
  fa: {
    common: faCommon,
    auth: faAuth,
    dashboard: faDashboard,
    account: faAccount,
    badges: faBadges,
    tables: faTables,
    email: faEmail,
  },
}

export function loadMessages(locale: Locale): Messages {
  return catalogs[locale] ?? catalogs.en
}
