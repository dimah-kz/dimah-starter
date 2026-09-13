"use client"

import type { ReactNode } from "react"
import { ItemGroup } from "@repo/ui/components/item"

type SettingsSectionProps = {
  label: string
  children: ReactNode
}

export function SettingsSection({ label, children }: SettingsSectionProps) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="px-1 text-xs font-medium text-muted-foreground">
        {label}
      </h2>
      <ItemGroup
        className="gap-0 overflow-hidden rounded-lg border"
        role="list"
      >
        {children}
      </ItemGroup>
    </section>
  )
}
