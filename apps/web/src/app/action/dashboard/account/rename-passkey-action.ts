"use server"

import { headers } from "next/headers"
import { refresh } from "next/cache"
import { getTranslations } from "next-intl/server"
import { getFormString, NAME_MAX_LENGTH } from "@/components/form/form-parse"
import { auth, getAuthApiErrorMessage } from "@repo/auth"

type RenamePasskeyResult = {
  success: boolean
  error?: string
}

export async function renamePasskeyAction(
  formData: FormData
): Promise<RenamePasskeyResult> {
  const id = getFormString(formData, "id")
  const name = getFormString(formData, "name")

  if (!name || name.length > NAME_MAX_LENGTH) {
    const t = await getTranslations("common.errors")
    return { success: false, error: t("nameInvalid", { max: NAME_MAX_LENGTH }) }
  }

  try {
    // Better Auth renames only the signed-in user's own passkey.
    await auth.api.updatePasskey({
      headers: await headers(),
      body: { id, name },
    })
  } catch (error) {
    return { success: false, error: getAuthApiErrorMessage(error) }
  }

  // Passkeys are read per request, not from a tag.
  refresh()
  return { success: true }
}
