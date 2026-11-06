"use server"

import { headers } from "next/headers"
import { updateTag } from "next/cache"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

type UnbanUserInput = {
  userId: string
}

type UnbanUserResult = {
  success: boolean
  error?: string
}

export async function unbanUserAction(
  input: UnbanUserInput
): Promise<UnbanUserResult> {
  try {
    await auth.api.unbanUser({
      headers: await headers(),
      body: { userId: input.userId },
    })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  updateTag(dashboardCacheTags.adminUsersPage())
  return { success: true }
}
