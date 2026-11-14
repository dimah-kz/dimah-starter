import { Suspense } from "react"
import { AccountConnectionsCard } from "@/app/dashboard/account/security/components/account-connections-card"
import { AccountPasswordCard } from "@/app/dashboard/account/security/components/account-password-card"
import { AccountTwoFactorCard } from "@/app/dashboard/account/security/components/account-two-factor-card"
import { getAccountSecurity } from "@/app/dashboard/account/lib/get-account-security"
import { DashboardPageFallback } from "@/app/dashboard/components/layout/dashboard-page-shell"
import { requireDashboardSession } from "@/app/dashboard/lib/dashboard-session"

type AccountSecurityPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/** The provider's own cancel button; not worth an error. */
const SILENT_OAUTH_ERRORS = new Set(["access_denied"])

export default function AccountSecurityPage({
  searchParams,
}: AccountSecurityPageProps) {
  return (
    <Suspense fallback={<DashboardPageFallback />}>
      <AccountSecurityPageContent searchParams={searchParams} />
    </Suspense>
  )
}

async function AccountSecurityPageContent({
  searchParams,
}: AccountSecurityPageProps) {
  await requireDashboardSession()
  const [security, params] = await Promise.all([
    getAccountSecurity(),
    searchParams,
  ])
  // Better Auth's OAuth callback returns here with `?error=` when linking fails.
  const callbackError = typeof params.error === "string" ? params.error : null

  return (
    <div className="flex flex-col gap-6">
      <AccountPasswordCard
        email={security.email}
        hasPassword={security.hasPassword}
      />
      <AccountTwoFactorCard
        enabled={security.twoFactorEnabled}
        hasPassword={security.hasPassword}
      />
      {security.connections.length > 0 ? (
        <AccountConnectionsCard
          connections={security.connections}
          signInMethodCount={security.signInMethodCount}
          callbackFailed={
            callbackError !== null && !SILENT_OAUTH_ERRORS.has(callbackError)
          }
        />
      ) : null}
    </div>
  )
}
