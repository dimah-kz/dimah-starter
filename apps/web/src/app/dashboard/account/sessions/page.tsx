import { Suspense } from "react"
import { AccountSessionsCard } from "@/app/dashboard/account/sessions/components/account-sessions-card"
import { getAccountSessions } from "@/app/dashboard/account/lib/get-account-sessions"
import { DashboardPageFallback } from "@/app/dashboard/components/layout/dashboard-page-shell"
import { requireDashboardSession } from "@/app/dashboard/lib/dashboard-session"

export default function AccountSessionsPage() {
  return (
    <Suspense fallback={<DashboardPageFallback />}>
      <AccountSessionsPageContent />
    </Suspense>
  )
}

async function AccountSessionsPageContent() {
  const session = await requireDashboardSession()
  const sessions = await getAccountSessions(session.session.id)

  return <AccountSessionsCard sessions={sessions} />
}
