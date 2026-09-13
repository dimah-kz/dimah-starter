"use client"

import { useId, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updateUserPlatformRoleAction } from "@/app/action/dashboard/admin/users/update-user-platform-role-action"
import type { AdminUserItem } from "@/app/dashboard/admin/users/lib/get-admin-users-page"
import { FormLabel } from "@/components/form/form-label"
import { ResponsiveFormOverlay } from "@/components/form/responsive-form-overlay"
import { Button } from "@repo/ui/components/button"
import { Checkbox } from "@repo/ui/components/checkbox"
import { Label } from "@repo/ui/components/label"
import { adminPluginRoles, type PlatformRole } from "@repo/auth/admin-access"
import { parseRoleString } from "@repo/auth/role-string"
import { toast } from "@repo/ui/components/toast"
import { useTranslations } from "next-intl"

const platformRoles = Object.keys(adminPluginRoles) as PlatformRole[]

function platformRolesFromUser(user: AdminUserItem | null) {
  if (!user) {
    return ["user"]
  }

  const tokens = parseRoleString(user.role)

  return tokens.length
    ? tokens.filter((token) =>
        (platformRoles as readonly string[]).includes(token)
      )
    : ["user"]
}

type UserPlatformRoleFormShellProps = {
  user: AdminUserItem | null
  open: boolean
  onClose: () => void
}

export function UserPlatformRoleFormShell({
  user,
  open,
  onClose,
}: UserPlatformRoleFormShellProps) {
  const t = useTranslations()
  const router = useRouter()
  const fieldId = useId()
  const [isPending, startTransition] = useTransition()
  const userId = user?.id ?? null
  const [rolesUserId, setRolesUserId] = useState(userId)
  const [roles, setRoles] = useState(() => platformRolesFromUser(user))

  if (rolesUserId !== userId) {
    setRolesUserId(userId)
    setRoles(platformRolesFromUser(user))
  }

  const canSubmit = Boolean(
    user &&
    roles.length > 0 &&
    roles.every((role) => (platformRoles as readonly string[]).includes(role))
  )

  const handleSubmit = () => {
    if (!user || !canSubmit) {
      return
    }

    startTransition(async () => {
      const result = await updateUserPlatformRoleAction({
        userId: user.id,
        roles: roles as PlatformRole[],
      })

      if (!result.success) {
        toast.add({
          title:
            result.error ?? t("dashboard.adminUserManage.roleUpdateFailed"),
          type: "error",
        })
        return
      }

      toast.add({
        title: t("dashboard.adminUserManage.roleUpdated"),
        type: "success",
      })
      onClose()
      router.refresh()
    })
  }

  const changeRoleLabel = t("dashboard.adminUserManage.changeRole")

  return (
    <ResponsiveFormOverlay
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onClose()
        }
      }}
      title={changeRoleLabel}
      description={user ? `${user.name} · ${user.email}` : undefined}
      footer={
        <>
          <Button
            type="button"
            disabled={isPending || !canSubmit}
            onClick={handleSubmit}
          >
            {t("dashboard.adminUserManage.saveRole")}
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
      {user ? (
        <div key={user.id} className="space-y-3">
          <FormLabel required>{t("common.roles")}</FormLabel>
          {platformRoles.map((option) => {
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
                  {t(`badges.platformRole.${option}`)}
                </Label>
              </div>
            )
          })}
        </div>
      ) : null}
    </ResponsiveFormOverlay>
  )
}
