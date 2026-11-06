"use client"

import { createAdminOrganizationsColumns } from "@/app/dashboard/admin/organizations/components/admin-organizations-columns"
import type { AdminOrganizationItem } from "@/app/dashboard/admin/organizations/lib/get-admin-organizations-page"
import { adminOrganizationsTablePath } from "@/app/dashboard/admin/organizations/lib/admin-organizations-table-params"
import {
  ListPagination,
  ListSearch,
  ListTable,
  useList,
} from "@/components/list"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card"
import type { Locale } from "@repo/i18n"
import { useLocale, useTranslations } from "next-intl"

type AdminOrganizationsTableProps = {
  organizations: AdminOrganizationItem[]
  page: number
  pageSize: number
  totalCount: number
  q?: string
}

export function AdminOrganizationsTable({
  organizations,
  page,
  pageSize,
  totalCount,
  q,
}: AdminOrganizationsTableProps) {
  const locale = useLocale() as Locale
  const t = useTranslations()
  const tTables = useTranslations("tables")

  const title = t("dashboard.adminTabs.organizations")
  const list = useList({
    buildPath: adminOrganizationsTablePath,
    page,
    pageSize,
    totalCount,
    q,
    countLabel: tTables("count.organizations"),
  })

  const columns = createAdminOrganizationsColumns({
    t: tTables,
    locale,
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardAction className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <ListSearch
            value={q}
            placeholder={tTables("search.organizations")}
            onCommit={list.setQuery}
          />
        </CardAction>
      </CardHeader>
      <CardContent>
        <ListTable
          rows={organizations}
          columns={columns}
          getRowId={(row) => row.id}
          caption={title}
          busy={list.isPending}
          empty={q ? tTables("empty.results") : tTables("empty.organizations")}
        />
      </CardContent>
      <CardFooter className="justify-between gap-2">
        {totalCount > 0 ? <ListPagination {...list.pagination} /> : null}
      </CardFooter>
    </Card>
  )
}
