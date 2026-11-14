"use server"

import { headers } from "next/headers"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

type GenerateBackupCodesResult =
  { success: true; backupCodes: string[] } | { success: false; error?: string }

/** Replaces the backup codes; the old ones stop working. */
export async function generateBackupCodesAction(
  password: string
): Promise<GenerateBackupCodesResult> {
  try {
    const { backupCodes } = await auth.api.generateBackupCodes({
      headers: await headers(),
      body: { password },
    })
    return { success: true, backupCodes }
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }
}
