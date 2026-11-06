import { Suspense } from "react"
import { io } from "next/cache"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { SignUpForm } from "@/app/(auth)/(email-password)/signup/components/signup-form"
import {
  DEFAULT_AUTH_REDIRECT,
  normalizeAuthRedirectTarget,
} from "@/app/(auth)/lib/auth-redirect"
import {
  auth,
  googleSignInEnabled,
  lastLoginMethodCookieName,
} from "@repo/auth"
import { passwordLimits } from "@repo/auth/password-limits"

type SignUpPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default function SignUpPage({ searchParams }: SignUpPageProps) {
  return (
    <Suspense
      fallback={
        <SignUpForm
          redirectTo={DEFAULT_AUTH_REDIRECT}
          passwordLimits={passwordLimits}
          googleSignInEnabled={googleSignInEnabled}
        />
      }
    >
      <SignUpPageContent searchParams={searchParams} />
    </Suspense>
  )
}

async function SignUpPageContent({ searchParams }: SignUpPageProps) {
  const params = await searchParams
  const redirectTo = normalizeAuthRedirectTarget(params.redirect)

  // Signed-in visitors skip the form. `io()` first: Better Auth reads the clock.
  await io()
  if (await auth.api.getSession({ headers: await headers() })) {
    redirect(redirectTo)
  }

  const cookieStore = await cookies()

  return (
    <SignUpForm
      redirectTo={redirectTo}
      passwordLimits={passwordLimits}
      googleSignInEnabled={googleSignInEnabled}
      lastLoginMethod={cookieStore.get(lastLoginMethodCookieName)?.value}
      oauthError={typeof params.error === "string" ? params.error : null}
    />
  )
}
