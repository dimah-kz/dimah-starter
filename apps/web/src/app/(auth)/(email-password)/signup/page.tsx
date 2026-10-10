import { Suspense } from "react"
import { cookies } from "next/headers"
import { SignUpForm } from "@/app/(auth)/(email-password)/signup/components/signup-form"
import {
  DEFAULT_AUTH_REDIRECT,
  normalizeAuthRedirectTarget,
} from "@/app/(auth)/lib/auth-redirect"

/** Better Auth `lastLoginMethod` cookie (httpOnly: false; plugin default). */
const LAST_LOGIN_METHOD_COOKIE = "better-auth.last_used_login_method"

type SignUpPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default function SignUpPage({ searchParams }: SignUpPageProps) {
  return (
    <Suspense fallback={<SignUpForm redirectTo={DEFAULT_AUTH_REDIRECT} />}>
      <SignUpPageContent searchParams={searchParams} />
    </Suspense>
  )
}

async function SignUpPageContent({ searchParams }: SignUpPageProps) {
  const params = await searchParams
  const redirectRaw =
    typeof params.redirect === "string" ? params.redirect : undefined
  const redirectTo = normalizeAuthRedirectTarget(redirectRaw)
  const cookieStore = await cookies()
  const lastLoginMethod =
    cookieStore.get(LAST_LOGIN_METHOD_COOKIE)?.value ?? null
  const oauthError = typeof params.error === "string" ? params.error : null

  return (
    <SignUpForm
      redirectTo={redirectTo}
      lastLoginMethod={lastLoginMethod}
      oauthError={oauthError}
    />
  )
}
