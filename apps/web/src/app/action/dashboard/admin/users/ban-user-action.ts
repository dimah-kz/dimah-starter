"use server"

import { headers } from "next/headers"
import { updateTag } from "next/cache"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

type BanUserInput = {
  userId: string
}

type BanUserResult = {
  success: boolean
  error?: string
}

export async function banUserAction(
  input: BanUserInput
): Promise<BanUserResult> {
  try {
    await auth.api.banUser({
      headers: await headers(),
      body: { userId: input.userId },
    })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  updateTag(dashboardCacheTags.adminUsersPage())
  return { success: true }
}
