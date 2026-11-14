import { Suspense } from "react"
import { AccountDeleteConfirm } from "@/app/dashboard/account/delete/components/account-delete-confirm"
import { DashboardPageFallback } from "@/app/dashboard/components/layout/dashboard-page-shell"
import { requireDashboardSession } from "@/app/dashboard/lib/dashboard-session"

type AccountDeletePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

/** Opened from the deletion mail; deletes only when the user confirms here. */
export default function AccountDeletePage({
  searchParams,
}: AccountDeletePageProps) {
  return (
    <Suspense fallback={<DashboardPageFallback />}>
      <AccountDeletePageContent searchParams={searchParams} />
    </Suspense>
  )
}

async function AccountDeletePageContent({
  searchParams,
}: AccountDeletePageProps) {
  const [session, params] = await Promise.all([
    requireDashboardSession(),
    searchParams,
  ])

  return (
    <AccountDeleteConfirm
      email={session.user.email}
      token={typeof params.token === "string" ? params.token : ""}
    />
  )
}
