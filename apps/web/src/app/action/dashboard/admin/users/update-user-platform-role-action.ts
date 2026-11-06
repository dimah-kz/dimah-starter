"use server"

import { headers } from "next/headers"
import { updateTag } from "next/cache"
import { getTranslations } from "next-intl/server"
import { dashboardCacheTags } from "@/app/dashboard/lib/cache-tags"
import { auth, getAuthApiErrorMessage } from "@repo/auth"
import type { PlatformRole } from "@repo/auth/admin-access"

type UpdateUserPlatformRoleInput = {
  userId: string
  roles: PlatformRole[]
}

type UpdateUserPlatformRoleResult = {
  success: boolean
  error?: string
}

/** Better Auth rejects roles that are not configured. */
export async function updateUserPlatformRoleAction(
  input: UpdateUserPlatformRoleInput
): Promise<UpdateUserPlatformRoleResult> {
  if (!input.roles.length) {
    const t = await getTranslations("common.errors")
    return { success: false, error: t("selectRole") }
  }

  try {
    await auth.api.setRole({
      headers: await headers(),
      body: { userId: input.userId, role: input.roles },
    })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  updateTag(dashboardCacheTags.adminUsersPage())
  return { success: true }
}
