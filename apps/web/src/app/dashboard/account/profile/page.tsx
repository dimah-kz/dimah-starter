import { notFound } from "next/navigation"
import { Suspense } from "react"
import { AccountAvatarCard } from "@/app/dashboard/account/profile/components/account-avatar-card"
import { AccountEmailCard } from "@/app/dashboard/account/profile/components/account-email-card"
import { AccountNameCard } from "@/app/dashboard/account/profile/components/account-name-card"
import { getAccountProfile } from "@/app/dashboard/account/lib/get-account-profile"
import { DashboardPageFallback } from "@/app/dashboard/components/layout/dashboard-page-shell"
import { requireDashboardSession } from "@/app/dashboard/lib/dashboard-session"
import { fromPublicUrl } from "@repo/storage"

export default function AccountProfilePage() {
  return (
    <Suspense fallback={<DashboardPageFallback />}>
      <AccountProfilePageContent />
    </Suspense>
  )
}

async function AccountProfilePageContent() {
  const session = await requireDashboardSession()
  const profile = await getAccountProfile(session.user.id)

  if (!profile) {
    notFound()
  }

  // From the session, not the cached profile: an email change finishes in
  // Better Auth's verify-email route, which refreshes the session cookie but
  // cannot expire the profile tag.
  const { email, emailVerified } = session.user

  return (
    <div className="flex flex-col gap-6">
      <AccountAvatarCard
        image={profile.image}
        imageKey={profile.image ? fromPublicUrl(profile.image) : null}
      />
      <AccountNameCard name={profile.name} />
      <AccountEmailCard
        key={email}
        email={email}
        emailVerified={emailVerified}
      />
    </div>
  )
}
