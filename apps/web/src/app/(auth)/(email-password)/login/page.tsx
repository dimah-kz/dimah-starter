import { Suspense } from "react"
import { cookies } from "next/headers"
import { LoginForm } from "@/app/(auth)/(email-password)/login/components/login-form"
import {
  DEFAULT_AUTH_REDIRECT,
  normalizeAuthRedirectTarget,
} from "@/app/(auth)/lib/auth-redirect"

/** Better Auth `lastLoginMethod` cookie (httpOnly: false; plugin default). */
const LAST_LOGIN_METHOD_COOKIE = "better-auth.last_used_login_method"

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default function LoginPage({ searchParams }: LoginPageProps) {
  return (
    <Suspense fallback={<LoginForm redirectTo={DEFAULT_AUTH_REDIRECT} />}>
      <LoginPageContent searchParams={searchParams} />
    </Suspense>
  )
}

async function LoginPageContent({ searchParams }: LoginPageProps) {
  const params = await searchParams
  const redirectRaw =
    typeof params.redirect === "string" ? params.redirect : undefined
  const redirectTo = normalizeAuthRedirectTarget(redirectRaw)
  const cookieStore = await cookies()
  const lastLoginMethod =
    cookieStore.get(LAST_LOGIN_METHOD_COOKIE)?.value ?? null
  const passwordReset = params.notice === "password-reset"
  const oauthError = typeof params.error === "string" ? params.error : null

  return (
    <LoginForm
      redirectTo={redirectTo}
      lastLoginMethod={lastLoginMethod}
      passwordReset={passwordReset}
      oauthError={oauthError}
    />
  )
}
