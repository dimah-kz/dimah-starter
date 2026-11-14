"use server"

import { headers } from "next/headers"
import { refresh } from "next/cache"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

type DeletePasskeyResult = {
  success: boolean
  error?: string
}

export async function deletePasskeyAction(
  id: string
): Promise<DeletePasskeyResult> {
  try {
    // Better Auth deletes only the signed-in user's own passkey.
    await auth.api.deletePasskey({
      headers: await headers(),
      body: { id },
    })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  // Passkeys are read per request, not from a tag.
  refresh()
  return { success: true }
}
