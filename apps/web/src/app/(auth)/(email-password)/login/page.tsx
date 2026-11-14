import { Suspense } from "react"
import { io } from "next/cache"
import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { LoginForm } from "@/app/(auth)/(email-password)/login/components/login-form"
import {
  DEFAULT_AUTH_REDIRECT,
  normalizeAuthRedirectTarget,
} from "@/app/(auth)/lib/auth-redirect"
import {
  auth,
  googleSignInEnabled,
  lastLoginMethodCookieName,
} from "@repo/auth"

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <Suspense
      fallback={
        <LoginForm
          redirectTo={DEFAULT_AUTH_REDIRECT}
          googleSignInEnabled={googleSignInEnabled}
        />
      }
    >
      <LoginPageContent searchParams={searchParams} />
    </Suspense>
  )
}

async function LoginPageContent({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const redirectTo = normalizeAuthRedirectTarget(params.redirect)

  // Signed-in visitors skip the form. `io()` first: Better Auth reads the clock.
  await io()
  if (await auth.api.getSession({ headers: await headers() })) {
    redirect(redirectTo)
  }

  const cookieStore = await cookies()

  return (
    <LoginForm
      redirectTo={redirectTo}
      googleSignInEnabled={googleSignInEnabled}
      lastLoginMethod={cookieStore.get(lastLoginMethodCookieName)?.value}
      passwordReset={params.notice === "password-reset"}
      oauthError={typeof params.error === "string" ? params.error : null}
    />
  )
}
