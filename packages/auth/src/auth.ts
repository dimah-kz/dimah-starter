import { after } from "next/server"
import { betterAuth } from "better-auth/minimal"
import { drizzleAdapter } from "@better-auth/drizzle-adapter/relations-v2"
import { i18n, locales as authErrorLocales } from "@better-auth/i18n"
import { nextCookies } from "better-auth/next-js"
import type { AccessControl } from "better-auth/plugins/access"
import { admin, lastLoginMethod, organization } from "better-auth/plugins"
import { db } from "@repo/db"
import * as schema from "@repo/db/schema"
import {
  sendOrganizationInvitation,
  sendPasswordReset,
  sendSignUpAttempt,
  sendVerification,
} from "@repo/email"
import {
  defaultLocale,
  localeCookieName,
  resolveLocaleFromHeaders,
} from "@repo/i18n"
import { appOrigin, toAbsoluteAppUrl } from "./app-origin"
import { adminPluginAc, adminPluginRoles } from "./admin-access"
import { orgAc, orgRoles } from "./organization-access"
import { passwordLimits } from "./password-limits"
import { acceptInvitationPath, loginPath } from "./paths"

const isProduction = process.env.NODE_ENV === "production"

const resetPasswordTokenExpiresIn = 60 * 60
const invitationExpiresIn = 60 * 60 * 48

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

export const auth = betterAuth({
  advanced: {
    database: {
      joins: true,
    },
    backgroundTasks: {
      handler: runAuthBackgroundTask,
    },
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL,
    ...(isProduction ? [] : ["http://localhost:3000"]),
  ].filter(Boolean) as string[],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
    schemaName: "auth",
  }),
  session: {
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
    expiresIn: resetPasswordTokenExpiresIn,
    sendVerificationEmail: async ({ user, url }, request) => {
      await sendVerification({
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
      await sendPasswordReset({
        to: user.email,
        url,
        locale: localeFromRequest(request),
      })
    },
    onExistingUserSignUp: async ({ user }, request) => {
      await sendSignUpAttempt({
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
          url: `${appOrigin()}${acceptInvitationPath(data.id)}`,
          locale: localeFromRequest(request),
          organizationName: data.organization.name,
          inviterName: data.inviter.user.name,
          role: data.role,
          expiresAt: data.invitation.expiresAt,
        })
      },
    }),
    i18n({
      translations: {
        en: authErrorLocales.en,
        fa: authErrorLocales.fa,
      },
      defaultLocale,
      detection: ["cookie", "header"],
      localeCookie: localeCookieName,
    }),
    lastLoginMethod({
      storeInDatabase: true,
    }),
    nextCookies(),
  ],
})

/** Non-null session payload from `auth.api.getSession` / `$Infer.Session`. */
export type Session = typeof auth.$Infer.Session
