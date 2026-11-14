import { after } from "next/server"
import { APIError } from "better-auth"
import { betterAuth } from "better-auth/minimal"
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2"
import { i18n, locales as authErrorLocales } from "@better-auth/i18n"
import { nextCookies } from "better-auth/next-js"
import type { AccessControl } from "better-auth/plugins/access"
import {
  admin,
  lastLoginMethod,
  organization,
  twoFactor,
} from "better-auth/plugins"
import { db } from "@repo/db"
import * as schema from "@repo/db/schema"
import { sendAuthMail, sendOrganizationInvitation } from "@repo/email"
import {
  defaultLocale,
  loadMessages,
  localeCookieName,
  locales,
  resolveLocaleFromHeaders,
} from "@repo/i18n"
import { DEV_ORIGIN, toAbsoluteAppUrl } from "./app-origin"
import { adminPluginAc, adminPluginRoles } from "./admin-access"
import { orgAc, orgRoles } from "./organization-access"
import { passwordLimits } from "./password-limits"
import { acceptInvitationPath, accountDeletionPath, loginPath } from "./paths"
import { listSoleOwnedOrganizations } from "./sole-owned-organizations"

const isProduction = process.env.NODE_ENV === "production"

const emailVerificationExpiresIn = 60 * 60
const resetPasswordTokenExpiresIn = 60 * 60
const invitationExpiresIn = 60 * 60 * 48
const deleteAccountTokenExpiresIn = 60 * 60
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
  // Names the app in authenticator apps (the TOTP issuer).
  appName: loadMessages(defaultLocale).common.appTitle,
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
      // Only an email change mails a verified user: its last link goes to the
      // new address. Sign-up and sign-in mail an unverified one.
      await sendAuthMail(user.emailVerified ? "changeEmailVerify" : "verify", {
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
      twoFactorEnabled: false,
      ...additionalFields,
      id,
    }),
  },
  socialProviders: google ? { google } : undefined,
  user: {
    changeEmail: {
      enabled: true,
      // The current address confirms first, then the new one is verified, so
      // a stolen session alone cannot move the account to another inbox.
      sendChangeEmailConfirmation: async ({ user, newEmail, url }, request) => {
        await sendAuthMail("changeEmailConfirm", {
          to: user.email,
          newEmail,
          url,
          locale: localeFromRequest(request),
        })
      },
    },
    deleteUser: {
      enabled: true,
      deleteTokenExpiresIn: deleteAccountTokenExpiresIn,
      // The mail opens a page that asks once more, instead of Better Auth's
      // GET callback, so a mail scanner following the link deletes nothing.
      sendDeleteAccountVerification: async ({ user, token }, request) => {
        await sendAuthMail("deleteAccount", {
          to: user.email,
          url: toAbsoluteAppUrl(
            `${accountDeletionPath}?token=${encodeURIComponent(token)}`
          ),
          locale: localeFromRequest(request),
        })
      },
      // Memberships cascade with the user; an organization must keep an owner.
      beforeDelete: async (user) => {
        if ((await listSoleOwnedOrganizations(user.id)).length > 0) {
          throw new APIError("BAD_REQUEST", {
            code: "SOLE_ORGANIZATION_OWNER",
            message:
              "Transfer or delete the organizations you own before deleting your account.",
          })
        }
      },
    },
  },
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
    // Authenticator app (TOTP) with backup codes. It asks for the second step
    // after email-and-password sign-in only; Google sign-in skips it.
    twoFactor(),
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
