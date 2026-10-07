"use client"

import { useInvitationStatusBadgeConfig } from "@/components/badge/badge-config"
import { LabeledBadge } from "@/components/badge/labeled-badge"

export function InvitationStatusBadge({ status }: { status: string }) {
  const config = useInvitationStatusBadgeConfig(status)
  return <LabeledBadge {...config} />
}
