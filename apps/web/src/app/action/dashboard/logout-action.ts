"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { authRoutes } from "@/app/(auth)/lib/auth-routes"
import { auth } from "@repo/auth"

export async function logoutAction() {
  await auth.api.signOut({ headers: await headers() })
  redirect(authRoutes.login())
}
