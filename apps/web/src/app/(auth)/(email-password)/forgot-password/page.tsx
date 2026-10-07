import { Suspense } from "react"
import { ForgotPasswordForm } from "@/app/(auth)/(email-password)/forgot-password/components/forgot-password-form"
import {
  DEFAULT_AUTH_REDIRECT,
  normalizeAuthRedirectTarget,
} from "@/app/(auth)/lib/auth-redirect"

type ForgotPasswordPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default function ForgotPasswordPage({
  searchParams,
}: ForgotPasswordPageProps) {
  return (
    <Suspense
      fallback={<ForgotPasswordForm redirectTo={DEFAULT_AUTH_REDIRECT} />}
    >
      <ForgotPasswordPageContent searchParams={searchParams} />
    </Suspense>
  )
}

async function ForgotPasswordPageContent({
  searchParams,
}: ForgotPasswordPageProps) {
  const params = await searchParams
  const redirectRaw =
    typeof params.redirect === "string" ? params.redirect : undefined

  return (
    <ForgotPasswordForm redirectTo={normalizeAuthRedirectTarget(redirectRaw)} />
  )
}
