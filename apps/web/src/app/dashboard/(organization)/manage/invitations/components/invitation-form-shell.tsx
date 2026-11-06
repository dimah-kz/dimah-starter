"use client"

import { useId, useState, useTransition } from "react"
import { createOrganizationInvitationAction } from "@/app/action/dashboard/(organization)/manage/invitations/create-organization-invitation-action"
import { memberRoleOptions } from "@/app/dashboard/(organization)/manage/lib/member-role-options"
import { FormLabel } from "@/components/form/form-label"
import { ResponsiveFormOverlay } from "@/components/form/responsive-form-overlay"
import type { MembershipRole } from "@repo/auth/organization-access"
import { Button } from "@repo/ui/components/button"
import { Input } from "@repo/ui/components/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select"
import { toast } from "@repo/ui/components/toast"
import { useTranslations } from "next-intl"

type InvitationFormShellProps = {
  organizationId: string
  actorRole: string | null
  open: boolean
  onClose: () => void
}

export function InvitationFormShell({
  organizationId,
  actorRole,
  open,
  onClose,
}: InvitationFormShellProps) {
  const t = useTranslations("dashboard.invitationManage")
  const tBadges = useTranslations("badges.membershipRole")
  const tCommon = useTranslations("common")
  const formId = useId()
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState("")
  const [role, setRole] = useState<MembershipRole>("member")
  const roleItems = memberRoleOptions(actorRole).map((option) => ({
    value: option,
    label: tBadges(option),
  }))
  const canSubmit = Boolean(email.trim())

  const close = () => {
    setEmail("")
    setRole("member")
    onClose()
  }

  const handleSubmit = () => {
    startTransition(async () => {
      const result = await createOrganizationInvitationAction({
        organizationId,
        email: email.trim(),
        role,
      })

      if (!result.success) {
        toast.add({
          title: result.error ?? t("sendFailed"),
          type: "error",
        })
        return
      }

      toast.add({ title: t("sent"), type: "success" })
      close()
    })
  }

  return (
    <ResponsiveFormOverlay
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) close()
      }}
      title={t("inviteTitle")}
      description={t("inviteDescription")}
      footer={
        <>
          <Button
            type="submit"
            form={formId}
            disabled={isPending || !canSubmit}
          >
            {isPending ? t("sending") : t("send")}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={close}
          >
            {tCommon("cancel")}
          </Button>
        </>
      }
    >
      <form
        id={formId}
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault()
          if (canSubmit) {
            handleSubmit()
          }
        }}
      >
        <div className="space-y-2">
          <FormLabel htmlFor={`${formId}-email`} required>
            {t("email")}
          </FormLabel>
          <Input
            id={`${formId}-email`}
            type="email"
            value={email}
            placeholder={t("emailPlaceholder")}
            autoComplete="email"
            required
            disabled={isPending}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <FormLabel htmlFor={`${formId}-role`} required>
            {t("role")}
          </FormLabel>
          <Select
            items={roleItems}
            value={role}
            onValueChange={(next) => {
              if (next) setRole(next)
            }}
          >
            <SelectTrigger id={`${formId}-role`} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {roleItems.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </form>
    </ResponsiveFormOverlay>
  )
}
