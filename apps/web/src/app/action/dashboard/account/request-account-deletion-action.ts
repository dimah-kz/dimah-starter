"use server"

import { headers } from "next/headers"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

type RequestAccountDeletionResult = {
  success: boolean
  error?: string
}

/**
 * Mails a link to the account's address. Nothing is deleted until that link's
 * page is confirmed with `deleteAccountAction`.
 */
export async function requestAccountDeletionAction(): Promise<RequestAccountDeletionResult> {
  try {
    await auth.api.deleteUser({ headers: await headers(), body: {} })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  return { success: true }
}
