"use client"

import { useId, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
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

function defaultInvitationRole(actorRole: string | null) {
  const options = memberRoleOptions(actorRole)
  if (options.includes("member")) return "member"
  return options[0] ?? "member"
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
  const router = useRouter()
  const emailId = useId()
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState("")
  const [role, setRole] = useState(() => defaultInvitationRole(actorRole))
  const options = memberRoleOptions(actorRole)
  const roleItems = options.map((option) => ({
    value: option,
    label: tBadges(option as MembershipRole),
  }))
  const canSubmit = Boolean(email.trim() && options.includes(role))

  const close = () => {
    setEmail("")
    setRole(defaultInvitationRole(actorRole))
    onClose()
  }

  const handleSubmit = () => {
    if (!canSubmit) return

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
      router.refresh()
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
            type="button"
            disabled={isPending || !canSubmit}
            onClick={handleSubmit}
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
      <div className="space-y-4">
        <div className="space-y-2">
          <FormLabel htmlFor={emailId} required>
            {t("email")}
          </FormLabel>
          <Input
            id={emailId}
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
          <FormLabel required>{t("role")}</FormLabel>
          <Select
            items={roleItems}
            value={role}
            onValueChange={(next) => {
              if (next) setRole(next)
            }}
          >
            <SelectTrigger className="w-full">
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
      </div>
    </ResponsiveFormOverlay>
  )
}
