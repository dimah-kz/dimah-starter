"use server"

import { updateTag } from "next/cache"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { authRoutes } from "@/app/(auth)/lib/auth-routes"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { auth } from "@repo/auth"

export async function logoutAction() {
  const userId =
    (await auth.api.getSession({ headers: await headers() }))?.user.id ?? null

  await auth.api.signOut({ headers: await headers() })

  if (userId) {
    updateTag(dashboardCacheTags.sidebarConfigByUser(userId))
  }

  redirect(authRoutes.login())
}
