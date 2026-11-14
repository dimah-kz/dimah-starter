import { Suspense } from "react"
import { io } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { TwoFactorForm } from "@/app/(auth)/(email-password)/two-factor/components/two-factor-form"
import {
  DEFAULT_AUTH_REDIRECT,
  normalizeAuthRedirectTarget,
} from "@/app/(auth)/lib/auth-redirect"
import { auth } from "@repo/auth"

type TwoFactorPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default function TwoFactorPage({ searchParams }: TwoFactorPageProps) {
  return (
    <Suspense fallback={<TwoFactorForm redirectTo={DEFAULT_AUTH_REDIRECT} />}>
      <TwoFactorPageContent searchParams={searchParams} />
    </Suspense>
  )
}

async function TwoFactorPageContent({ searchParams }: TwoFactorPageProps) {
  const params = await searchParams
  const redirectTo = normalizeAuthRedirectTarget(params.redirect)

  // Signed-in visitors skip the form. `io()` first: Better Auth reads the clock.
  await io()
  if (await auth.api.getSession({ headers: await headers() })) {
    redirect(redirectTo)
  }

  return <TwoFactorForm redirectTo={redirectTo} />
}
