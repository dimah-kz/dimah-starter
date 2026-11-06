import { after } from "next/server"
import { betterAuth } from "better-auth/minimal"
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2"
import { i18n, locales as authErrorLocales } from "@better-auth/i18n"
import { nextCookies } from "better-auth/next-js"
import type { AccessControl } from "better-auth/plugins/access"
import { admin, lastLoginMethod, organization } from "better-auth/plugins"
import { db } from "@repo/db"
import * as schema from "@repo/db/schema"
import { sendAuthMail, sendOrganizationInvitation } from "@repo/email"
import {
  defaultLocale,
  localeCookieName,
  locales,
  resolveLocaleFromHeaders,
} from "@repo/i18n"
import { DEV_ORIGIN, toAbsoluteAppUrl } from "./app-origin"
import { adminPluginAc, adminPluginRoles } from "./admin-access"
import { orgAc, orgRoles } from "./organization-access"
import { passwordLimits } from "./password-limits"
import { acceptInvitationPath, loginPath } from "./paths"

const isProduction = process.env.NODE_ENV === "production"

const emailVerificationExpiresIn = 60 * 60
const resetPasswordTokenExpiresIn = 60 * 60
const invitationExpiresIn = 60 * 60 * 48
const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim()
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim()
const google =
  googleClientId && googleClientSecret
    ? { clientId: googleClientId, clientSecret: googleClientSecret }
    : undefined

/** Google is registered only when both env vars are set; the login UI hides its button otherwise. */
export const googleSignInEnabled = google !== undefined

/** Readable (not httpOnly) cookie the login UI uses for its "Last used" badge. */
export const lastLoginMethodCookieName = "better-auth.last_used_login_method"

export const auth = betterAuth({
  advanced: {
    database: {
      joins: true,
    },
    backgroundTasks: {
      handler: runAuthBackgroundTask,
    },
  },
  // The baseURL (`BETTER_AUTH_URL`) is trusted already. Development may leave
  // it unset, so trust the origin `toAbsoluteAppUrl` falls back to.
  trustedOrigins: isProduction ? [] : [DEV_ORIGIN],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    schemaName: "auth",
  }),
  session: {
    // 0 skips the freshness check. The account page lists sessions, and
    // `listSessions` would otherwise reject a session older than a day.
    freshAge: 0,
    // Cookie cache skips a DB read. Ban/role changes can lag until maxAge.
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  rateLimit: {
    storage: "database",
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
    expiresIn: emailVerificationExpiresIn,
    sendVerificationEmail: async ({ user, url }, request) => {
      await sendAuthMail("verify", {
        to: user.email,
        url,
        locale: localeFromRequest(request),
      })
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: passwordLimits.minLength,
    maxPasswordLength: passwordLimits.maxLength,
    resetPasswordTokenExpiresIn,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }, request) => {
      await sendAuthMail("reset", {
        to: user.email,
        url,
        locale: localeFromRequest(request),
      })
    },
    onExistingUserSignUp: async ({ user }, request) => {
      await sendAuthMail("signUpAttempt", {
        to: user.email,
        url: toAbsoluteAppUrl(loginPath),
        locale: localeFromRequest(request),
      })
    },
    customSyntheticUser: ({ coreFields, additionalFields, id }) => ({
      ...coreFields,
      role: "user",
      banned: false,
      banReason: null,
      banExpires: null,
      lastLoginMethod: null,
      ...additionalFields,
      id,
    }),
  },
  socialProviders: google ? { google } : undefined,
  plugins: [
    admin({
      ac: adminPluginAc as AccessControl,
      roles: adminPluginRoles,
    }),
    organization({
      ac: orgAc as AccessControl,
      roles: orgRoles,
      invitationExpiresIn,
      cancelPendingInvitationsOnReInvite: true,
      requireEmailVerificationOnInvitation: true,
      sendInvitationEmail: async (data, request) => {
        await sendOrganizationInvitation({
          to: data.email,
          url: toAbsoluteAppUrl(acceptInvitationPath(data.id)),
          locale: localeFromRequest(request),
          organizationName: data.organization.name,
          inviterName: data.inviter.user.name,
          role: data.role,
          expiresAt: data.invitation.expiresAt,
        })
      },
    }),
    i18n({
      translations: Object.fromEntries(
        locales.map((locale) => [locale, authErrorLocales[locale]])
      ),
      defaultLocale,
      detection: ["cookie", "header"],
      localeCookie: localeCookieName,
    }),
    lastLoginMethod({
      storeInDatabase: true,
      cookieName: lastLoginMethodCookieName,
    }),
    nextCookies(),
  ],
})

/** Non-null session payload from `auth.api.getSession` / `$Infer.Session`. */
export type Session = typeof auth.$Infer.Session

function runAuthBackgroundTask(promise: Promise<unknown>) {
  try {
    after(() => promise)
  } catch {
    void promise
  }
}

function localeFromRequest(request?: Request) {
  if (!request) {
    return defaultLocale
  }

  return resolveLocaleFromHeaders(request.headers)
}
