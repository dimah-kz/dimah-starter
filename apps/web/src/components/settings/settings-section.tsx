import type { ReactNode } from "react"

type SettingsSectionProps = {
  label: string
  children: ReactNode
}

/** Titled group of settings rows; each row is a button or a link. */
export function SettingsSection({ label, children }: SettingsSectionProps) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="px-1 text-xs font-medium text-muted-foreground">
        {label}
      </h2>
      <div className="flex flex-col overflow-hidden rounded-lg border">
        {children}
      </div>
    </section>
  )
}
