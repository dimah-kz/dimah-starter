"use client"

import {
  BanIcon,
  CircleCheckIcon,
  CircleXIcon,
  ClockIcon,
  CrownIcon,
  ShieldAlertIcon,
  ShieldIcon,
  TimerOffIcon,
  UserIcon,
} from "lucide-react"
import {
  type LabeledBadgeConfig,
  type LabeledBadgeVariant,
} from "@/components/badge/labeled-badge"
import { adminPluginRoles, type PlatformRole } from "@repo/auth/admin-access"
import { orgRoles, type MembershipRole } from "@repo/auth/organization-access"
import { useTranslations } from "next-intl"
import type { ReactElement } from "react"

function item(
  label: string,
  variant: LabeledBadgeVariant,
  icon: ReactElement
): LabeledBadgeConfig {
  return { label, variant, icon }
}

type UserAccountStatus = "active" | "banned"

const platformRoleVariants: Record<PlatformRole, LabeledBadgeVariant> = {
  user: "outline",
  admin: "primary-light",
}

const membershipRoleVariants: Record<MembershipRole, LabeledBadgeVariant> = {
  owner: "primary-light",
  admin: "secondary",
  member: "outline",
}

const userAccountStatusVariants: Record<
  UserAccountStatus,
  LabeledBadgeVariant
> = {
  active: "success-light",
  banned: "destructive-light",
}

function platformRoleIcon(role: PlatformRole) {
  return role === "admin" ? <ShieldIcon /> : <UserIcon />
}

function membershipRoleIcon(role: MembershipRole) {
  if (role === "owner") return <CrownIcon />
  if (role === "admin") return <ShieldIcon />
  return <UserIcon />
}

function userAccountStatusIcon(status: UserAccountStatus) {
  return status === "banned" ? <ShieldAlertIcon /> : <UserIcon />
}

const invitationStatuses = [
  "pending",
  "accepted",
  "rejected",
  "canceled",
  "expired",
] as const

type InvitationStatus = (typeof invitationStatuses)[number]

const invitationStatusVariants: Record<InvitationStatus, LabeledBadgeVariant> =
  {
    pending: "info-light",
    accepted: "success-light",
    rejected: "destructive-light",
    canceled: "outline",
    expired: "warning-light",
  }

function isInvitationStatus(value: string): value is InvitationStatus {
  return (invitationStatuses as readonly string[]).includes(value)
}

function invitationStatusIcon(status: InvitationStatus) {
  if (status === "accepted") return <CircleCheckIcon />
  if (status === "rejected") return <CircleXIcon />
  if (status === "canceled") return <BanIcon />
  if (status === "expired") return <TimerOffIcon />
  return <ClockIcon />
}

function isPlatformRole(value: string): value is PlatformRole {
  return value in adminPluginRoles
}

function isMembershipRole(value: string): value is MembershipRole {
  return value in orgRoles
}

export function usePlatformRoleBadgeConfig(role: string): LabeledBadgeConfig {
  const t = useTranslations("badges")
  const normalizedValue = role.trim()

  if (isPlatformRole(normalizedValue)) {
    return item(
      t(`platformRole.${normalizedValue}`),
      platformRoleVariants[normalizedValue],
      platformRoleIcon(normalizedValue)
    )
  }

  return {
    label: normalizedValue || t("fallback"),
    variant: "outline",
    icon: <UserIcon />,
  }
}

export function useMembershipRoleBadgeConfig(role: string): LabeledBadgeConfig {
  const t = useTranslations("badges")
  const normalizedValue = role.trim()

  if (isMembershipRole(normalizedValue)) {
    return item(
      t(`membershipRole.${normalizedValue}`),
      membershipRoleVariants[normalizedValue],
      membershipRoleIcon(normalizedValue)
    )
  }

  return {
    label: normalizedValue || t("fallback"),
    variant: "outline",
    icon: <UserIcon />,
  }
}

export function useUserAccountStatusBadgeConfig(
  status: UserAccountStatus
): LabeledBadgeConfig {
  const t = useTranslations("badges")

  return item(
    t(`userAccountStatus.${status}`),
    userAccountStatusVariants[status],
    userAccountStatusIcon(status)
  )
}

export function useInvitationStatusBadgeConfig(
  status: string
): LabeledBadgeConfig {
  const t = useTranslations("badges")
  const normalizedValue = status.trim()

  if (isInvitationStatus(normalizedValue)) {
    return item(
      t(`invitationStatus.${normalizedValue}`),
      invitationStatusVariants[normalizedValue],
      invitationStatusIcon(normalizedValue)
    )
  }

  return {
    label: normalizedValue || t("fallback"),
    variant: "outline",
    icon: <ClockIcon />,
  }
}
