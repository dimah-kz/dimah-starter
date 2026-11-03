import { notFound } from "next/navigation"
import { Suspense } from "react"
import { AccountSettingsHub } from "@/app/dashboard/account/components/account-settings-hub"
import { getAccountProfile } from "@/app/dashboard/account/lib/get-account-profile"
import { DashboardPageFallback } from "@/app/dashboard/components/layout/dashboard-page-shell"
import { requireDashboardSession } from "@/app/dashboard/lib/dashboard-session"
import { fromPublicUrl } from "@repo/storage"

export default function AccountPage() {
  return (
    <Suspense fallback={<DashboardPageFallback />}>
      <AccountPageContent />
    </Suspense>
  )
}

async function AccountPageContent() {
  const session = await requireDashboardSession()
  const profile = await getAccountProfile(session.user.id)

  if (!profile) {
    notFound()
  }

  return (
    <AccountSettingsHub
      profile={{
        ...profile,
        imageKey: profile.image ? fromPublicUrl(profile.image) : null,
      }}
    />
  )
}
