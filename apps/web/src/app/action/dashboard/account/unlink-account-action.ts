"use server"

import { headers } from "next/headers"
import { refresh } from "next/cache"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

type UnlinkAccountResult = {
  success: boolean
  error?: string
}

/** Better Auth refuses to unlink the last way to sign in. */
export async function unlinkAccountAction(
  accountId: string
): Promise<UnlinkAccountResult> {
  try {
    await auth.api.unlinkAccount({
      headers: await headers(),
      body: { accountId },
    })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  // Sign-in methods are read per request, not from a tag.
  refresh()
  return { success: true }
}
