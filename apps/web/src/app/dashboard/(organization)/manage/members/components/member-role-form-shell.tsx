"use client"

import { useId, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateOrganizationMemberRoleAction } from "@/app/action/dashboard/(organization)/manage/members/update-organization-member-role-action"
import { FormLabel } from "@/components/form/form-label"
import { ResponsiveFormOverlay } from "@/components/form/responsive-form-overlay"
import { Button } from "@repo/ui/components/button"
import { Checkbox } from "@repo/ui/components/checkbox"
import { Label } from "@repo/ui/components/label"
import { memberRoleOptions } from "@/app/dashboard/(organization)/manage/members/lib/member-role-options"
import type { OrganizationMemberItem } from "@/app/dashboard/(organization)/manage/members/lib/get-organization-members-page"
import type { MembershipRole } from "@repo/auth/organization-access"
import { parseRoleString } from "@repo/auth/role-string"
import { toast } from "@repo/ui/components/toast"
import { useTranslations } from "next-intl"

type MemberRoleFormShellProps = {
  organizationId: string
  member: OrganizationMemberItem | null
  actorRole: string | null
  open: boolean
  onClose: () => void
}

export function MemberRoleFormShell({
  organizationId,
  member,
  actorRole,
  open,
  onClose,
}: MemberRoleFormShellProps) {
  const t = useTranslations()
  const router = useRouter()
  const fieldId = useId()
  const [isPending, startTransition] = useTransition()
  const memberId = member?.id ?? null
  const [rolesMemberId, setRolesMemberId] = useState(memberId)
  const [roles, setRoles] = useState(() =>
    member ? parseRoleString(member.role) : ["member"]
  )

  if (rolesMemberId !== memberId) {
    setRolesMemberId(memberId)
    setRoles(member ? parseRoleString(member.role) : ["member"])
  }

  const options = memberRoleOptions(actorRole)
  const canSubmit = Boolean(
    member && roles.length > 0 && roles.every((role) => options.includes(role))
  )

  const handleSubmit = () => {
    if (!member || !canSubmit) {
      return
    }

    startTransition(async () => {
      const result = await updateOrganizationMemberRoleAction({
        organizationId,
        memberId: member.id,
        roles,
      })

      if (!result.success) {
        toast.add({
          title: result.error ?? t("dashboard.memberManage.roleUpdateFailed"),
          type: "error",
        })
        return
      }

      toast.add({
        title: t("dashboard.memberManage.roleUpdated"),
        type: "success",
      })
      onClose()
      router.refresh()
    })
  }

  const changeRoleLabel = t("dashboard.memberManage.changeRole")

  return (
    <ResponsiveFormOverlay
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose()
        }
      }}
      title={changeRoleLabel}
      footer={
        <>
          <Button
            type="button"
            disabled={isPending || !canSubmit}
            onClick={handleSubmit}
          >
            {t("dashboard.memberManage.saveRole")}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={onClose}
          >
            {t("common.cancel")}
          </Button>
        </>
      }
    >
      {member ? (
        <div key={member.id} className="space-y-3">
          <FormLabel required>{t("common.roles")}</FormLabel>
          {options.map((option) => {
            const checkboxId = `${fieldId}-${option}`

            return (
              <div key={option} className="flex items-center gap-2">
                <Checkbox
                  id={checkboxId}
                  checked={roles.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked === true) {
                      setRoles([...roles, option])
                      return
                    }

                    setRoles(roles.filter((role) => role !== option))
                  }}
                  disabled={isPending}
                />
                <Label htmlFor={checkboxId} className="font-normal">
                  {t(`badges.membershipRole.${option as MembershipRole}`)}
                </Label>
              </div>
            )
          })}
        </div>
      ) : null}
    </ResponsiveFormOverlay>
  )
}
