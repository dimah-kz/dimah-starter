"use client"

import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { accountTabs } from "@/app/dashboard/account/lib/account-tabs"
import { adminSlices } from "@/app/dashboard/admin/lib/admin-slices"
import { organizationManageTabs } from "@/app/dashboard/(organization)/manage/lib/organization-manage-tabs"
import { isPathActive } from "@/app/dashboard/lib/path-utils"

const sections = [...adminSlices, ...organizationManageTabs, ...accountTabs]

export function DashboardSectionHeading() {
  const pathname = usePathname()
  const t = useTranslations("dashboard")
  const section = sections
    .filter((item) => isPathActive(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0]

  if (!section) {
    return null
  }

  const title = (
    <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
      {t(section.labelKey)}
    </h1>
  )

  if (!("descriptionKey" in section)) {
    return title
  }

  return (
    <div className="flex flex-col gap-1">
      {title}
      <p className="text-sm text-muted-foreground">
        {t(section.descriptionKey)}
      </p>
    </div>
  )
}
