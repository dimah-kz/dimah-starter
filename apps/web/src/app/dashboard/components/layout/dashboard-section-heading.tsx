"use client"

import { usePathname } from "next/navigation"
import { useTranslations } from "next-intl"
import { adminSlices } from "@/app/dashboard/admin/lib/admin-slices"
import { organizationManageTabs } from "@/app/dashboard/(organization)/manage/lib/organization-manage-tabs"
import { isPathActive } from "@/app/dashboard/lib/path-utils"

const sections = [...adminSlices, ...organizationManageTabs]

export function DashboardSectionHeading() {
  const pathname = usePathname()
  const t = useTranslations("dashboard")
  const section = sections
    .filter((item) => isPathActive(pathname, item.href))
    .sort((a, b) => b.href.length - a.href.length)[0]

  if (!section) {
    return null
  }

  return (
    <h1 className="text-lg font-semibold tracking-tight sm:text-xl">
      {t(section.labelKey)}
    </h1>
  )
}
