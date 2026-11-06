"use client"

import Link from "next/link"
import { useSearchParams } from "next/navigation"
import type { AuthRoutePath } from "@/app/(auth)/lib/auth-routes"
import {
  normalizeAuthRedirectTarget,
  withAuthRedirect,
} from "@/app/(auth)/lib/auth-redirect"

type AuthCrossLinkProps = {
  target: AuthRoutePath
  children: React.ReactNode
  className?: string
}

/** Link to another auth page that keeps the current `redirect` param. */
export function AuthCrossLink({
  target,
  children,
  className,
}: AuthCrossLinkProps) {
  const searchParams = useSearchParams()
  const redirectTo = normalizeAuthRedirectTarget(searchParams.get("redirect"))

  return (
    <Link className={className} href={withAuthRedirect(target, redirectTo)}>
      {children}
    </Link>
  )
}
