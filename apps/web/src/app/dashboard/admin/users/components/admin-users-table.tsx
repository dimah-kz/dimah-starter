"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { banUserAction } from "@/app/action/dashboard/admin/users/ban-user-action"
import { unbanUserAction } from "@/app/action/dashboard/admin/users/unban-user-action"
import { createAdminUsersColumns } from "@/app/dashboard/admin/users/components/admin-users-columns"
import type { AdminUserItem } from "@/app/dashboard/admin/users/lib/get-admin-users-page"
import {
  adminUsersTablePath,
  type AdminUserTableFilter,
} from "@/app/dashboard/admin/users/lib/admin-users-table-params"
import {
  ListPagination,
  ListSearch,
  ListTable,
  useList,
} from "@/components/list"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@repo/ui/components/alert-dialog"
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@repo/ui/components/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select"
import type { Locale } from "@repo/i18n"
import { toast } from "@repo/ui/components/toast"
import { useLocale, useTranslations } from "next-intl"

type AdminUsersTableProps = {
  users: AdminUserItem[]
  page: number
  pageSize: number
  totalCount: number
  filter: AdminUserTableFilter
  q?: string
  actorUserId: string
  onChangeRole: (user: AdminUserItem) => void
}

export function AdminUsersTable({
  users,
  page,
  pageSize,
  totalCount,
  filter,
  q,
  actorUserId,
  onChangeRole,
}: AdminUsersTableProps) {
  const locale = useLocale() as Locale
  const t = useTranslations()
  const tTables = useTranslations("tables")
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [banTarget, setBanTarget] = useState<AdminUserItem | null>(null)

  const title = t("dashboard.adminTabs.users")
  const list = useList({
    buildPath: adminUsersTablePath,
    page,
    pageSize,
    totalCount,
    filter,
    q,
    countLabel: tTables("count.users"),
  })

  const filterOptions = (["all", "admins", "users", "banned"] as const).map(
    (value) => ({
      value,
      label: t(`tables.filters.${value}`),
    })
  )

  const columns = useMemo(
    () =>
      createAdminUsersColumns({
        t: tTables,
        locale,
        actorUserId,
        disabled: isPending,
        onChangeRole,
        onBan: setBanTarget,
        onUnban: (user) => {
          startTransition(async () => {
            const result = await unbanUserAction({ userId: user.id })
            if (!result.success) {
              toast.add({
                title:
                  result.error ?? t("dashboard.adminUserManage.unbanFailed"),
                type: "error",
              })
              return
            }
            toast.add({
              title: t("dashboard.adminUserManage.unbanned"),
              type: "success",
            })
            router.refresh()
          })
        },
      }),
    [actorUserId, isPending, locale, onChangeRole, router, t, tTables]
  )

  const handleBan = () => {
    if (!banTarget) return
    startTransition(async () => {
      const result = await banUserAction({ userId: banTarget.id })
      if (!result.success) {
        toast.add({
          title: result.error ?? t("dashboard.adminUserManage.banFailed"),
          type: "error",
        })
        return
      }
      setBanTarget(null)
      toast.add({
        title: t("dashboard.adminUserManage.banned"),
        type: "success",
      })
      router.refresh()
    })
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardAction className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <ListSearch
              value={q}
              placeholder={tTables("search.users")}
              onCommit={list.setQuery}
            />
            <Select
              items={filterOptions}
              value={filter}
              onValueChange={(next) => {
                if (next) {
                  list.setFilter(next)
                }
              }}
            >
              <SelectTrigger className="w-full shrink-0 sm:w-fit">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {filterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardAction>
        </CardHeader>
        <CardContent>
          <ListTable
            rows={users}
            columns={columns}
            getRowId={(row) => row.id}
            caption={title}
            busy={list.isPending}
            empty={
              q || filter !== "all"
                ? tTables("empty.results")
                : tTables("empty.users")
            }
          />
        </CardContent>
        <CardFooter className="justify-between gap-2">
          {totalCount > 0 ? <ListPagination {...list.pagination} /> : null}
        </CardFooter>
      </Card>

      <AlertDialog
        open={Boolean(banTarget)}
        onOpenChange={(open) => {
          if (!open) setBanTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("dashboard.adminUserManage.banTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {banTarget
                ? t("dashboard.adminUserManage.banDescription", {
                    name: banTarget.name,
                  })
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={isPending}
              onClick={handleBan}
            >
              {t("dashboard.adminUserManage.banConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
