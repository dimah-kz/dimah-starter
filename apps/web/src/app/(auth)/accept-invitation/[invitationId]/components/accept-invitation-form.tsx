"use client"

import { useActionState } from "react"
import { acceptInvitationAction } from "@/app/action/auth/accept-invitation-action"
import { rejectInvitationAction } from "@/app/action/auth/reject-invitation-action"
import { AUTH_FORM_INITIAL_STATE } from "@/app/(auth)/lib/auth-form-state"
import { FormSubmitButton } from "@/components/form/form-submit-button"
import { Alert, AlertDescription } from "@repo/ui/components/alert"
import { useTranslations } from "next-intl"

type AcceptInvitationFormProps = {
  invitationId: string
}

export function AcceptInvitationForm({
  invitationId,
}: AcceptInvitationFormProps) {
  const t = useTranslations("auth.acceptInvitation")
  const [acceptState, acceptAction] = useActionState(
    acceptInvitationAction,
    AUTH_FORM_INITIAL_STATE
  )
  const [rejectState, rejectAction] = useActionState(
    rejectInvitationAction,
    AUTH_FORM_INITIAL_STATE
  )
  const formError = acceptState.formError ?? rejectState.formError

  return (
    <div className="space-y-3">
      {formError ? (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}
      <form action={acceptAction}>
        <input type="hidden" name="invitationId" value={invitationId} />
        <FormSubmitButton idleText={t("accept")} loadingText={t("accepting")} />
      </form>
      <form action={rejectAction}>
        <input type="hidden" name="invitationId" value={invitationId} />
        <FormSubmitButton
          variant="outline"
          idleText={t("reject")}
          loadingText={t("rejecting")}
        />
      </form>
    </div>
  )
}
