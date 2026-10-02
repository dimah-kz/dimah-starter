"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { removeOrganizationMemberAction } from "@/app/action/dashboard/(organization)/manage/members/remove-organization-member-action"
import { createMembersColumns } from "@/app/dashboard/(organization)/manage/members/components/members-columns"
import type { OrganizationMemberItem } from "@/app/dashboard/(organization)/manage/members/lib/get-organization-members-page"
import {
  organizationMembersTablePath,
  type MemberTableFilter,
} from "@/app/dashboard/(organization)/manage/members/lib/members-table-params"
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

type MembersTableProps = {
  organizationId: string
  members: OrganizationMemberItem[]
  page: number
  pageSize: number
  totalCount: number
  filter: MemberTableFilter
  q?: string
  actorUserId: string
  actorRole: string | null
  onChangeRole: (member: OrganizationMemberItem) => void
}

export function MembersTable({
  organizationId,
  members,
  page,
  pageSize,
  totalCount,
  filter,
  q,
  actorUserId,
  actorRole,
  onChangeRole,
}: MembersTableProps) {
  const locale = useLocale() as Locale
  const t = useTranslations()
  const tTables = useTranslations("tables")
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [removeTarget, setRemoveTarget] =
    useState<OrganizationMemberItem | null>(null)

  const title = t("dashboard.manageTabs.members")
  const list = useList({
    buildPath: organizationMembersTablePath,
    page,
    pageSize,
    totalCount,
    filter,
    q,
    countLabel: tTables("count.members"),
  })

  const memberFilterOptions = (["all", "managers", "members"] as const).map(
    (value) => ({
      value,
      label: t(`tables.filters.${value}`),
    })
  )

  const columns = useMemo(
    () =>
      createMembersColumns({
        t: tTables,
        locale,
        actorUserId,
        actorRole,
        disabled: isPending,
        onChangeRole,
        onRemove: setRemoveTarget,
      }),
    [actorRole, actorUserId, isPending, locale, onChangeRole, tTables]
  )

  const handleRemove = () => {
    if (!removeTarget) return
    startTransition(async () => {
      const result = await removeOrganizationMemberAction({
        organizationId,
        memberId: removeTarget.id,
      })
      if (!result.success) {
        toast.add({
          title: result.error ?? t("dashboard.memberManage.removeFailed"),
          type: "error",
        })
        return
      }
      setRemoveTarget(null)
      toast.add({
        title: t("dashboard.memberManage.removed"),
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
              placeholder={tTables("search.members")}
              onCommit={list.setQuery}
            />
            <Select
              items={memberFilterOptions}
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
                {memberFilterOptions.map((option) => (
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
            rows={members}
            columns={columns}
            getRowId={(row) => row.id}
            caption={title}
            busy={list.isPending}
            empty={
              q || filter !== "all"
                ? tTables("empty.results")
                : tTables("empty.members")
            }
          />
        </CardContent>
        <CardFooter className="justify-between gap-2">
          {totalCount > 0 ? <ListPagination {...list.pagination} /> : null}
        </CardFooter>
      </Card>

      <AlertDialog
        open={Boolean(removeTarget)}
        onOpenChange={(open) => {
          if (!open) setRemoveTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t("dashboard.memberManage.removeTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {removeTarget
                ? t("dashboard.memberManage.removeDescription", {
                    name: removeTarget.name,
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
              onClick={handleRemove}
            >
              {t("dashboard.memberManage.removeConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
