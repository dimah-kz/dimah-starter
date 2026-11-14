import { desc, eq, isNotNull } from "@repo/db/drizzle"
import { requireDashboardSession } from "@/app/dashboard/lib/dashboard-session"
import { googleSignInEnabled } from "@repo/auth"
import { account, passkey, user } from "@repo/db/schema"
import { db } from "@repo/db"

const CREDENTIAL_PROVIDER_ID = "credential"

/** Sign-in providers the account page can connect, in display order. */
export const accountConnectionProviders = ["google"] as const

export type AccountConnectionProvider =
  (typeof accountConnectionProviders)[number]

export type AccountConnection = {
  provider: AccountConnectionProvider
  /** Better Auth account id, for unlinking; `null` when not connected. */
  accountId: string | null
  connectedAt: Date | null
}

const providerEnabled: Record<AccountConnectionProvider, boolean> = {
  google: googleSignInEnabled,
}

/**
 * Sign-in methods, passkeys and two-factor state of the signed-in user. Read
 * per request, not cached: linking Google finishes in Better Auth's OAuth
 * callback, which has no action to expire a tag.
 */
export async function getAccountSecurity() {
  const session = await requireDashboardSession()
  const userId = session.user.id

  const [accounts, passkeys, [row]] = await Promise.all([
    db
      .select({
        id: account.id,
        providerId: account.providerId,
        hasPassword: isNotNull(account.password).mapWith(Boolean),
        createdAt: account.createdAt,
      })
      .from(account)
      .where(eq(account.userId, userId)),
    db
      .select({
        id: passkey.id,
        name: passkey.name,
        createdAt: passkey.createdAt,
        // Synced by a password manager or the platform, not bound to one device.
        backedUp: passkey.backedUp,
      })
      .from(passkey)
      .where(eq(passkey.userId, userId))
      .orderBy(desc(passkey.createdAt)),
    db
      .select({ twoFactorEnabled: user.twoFactorEnabled })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1),
  ])

  const connections = accountConnectionProviders.flatMap(
    (provider): AccountConnection[] => {
      const linked = accounts.find(({ providerId }) => providerId === provider)

      // A provider turned off in the config still shows while it is linked,
      // so it can be disconnected.
      if (!linked && !providerEnabled[provider]) {
        return []
      }

      return [
        {
          provider,
          accountId: linked?.id ?? null,
          connectedAt: linked?.createdAt ?? null,
        },
      ]
    }
  )

  return {
    email: session.user.email,
    hasPassword: accounts.some(
      ({ providerId, hasPassword }) =>
        providerId === CREDENTIAL_PROVIDER_ID && hasPassword
    ),
    twoFactorEnabled: row?.twoFactorEnabled === true,
    /** Better Auth refuses to unlink the last one. */
    signInMethodCount: accounts.length,
    connections,
    passkeys,
  }
}

export type AccountSecurity = Awaited<ReturnType<typeof getAccountSecurity>>
