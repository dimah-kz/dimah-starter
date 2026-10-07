"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { PlusIcon } from "lucide-react"
import { cancelOrganizationInvitationAction } from "@/app/action/dashboard/(organization)/manage/invitations/cancel-organization-invitation-action"
import { createInvitationsColumns } from "@/app/dashboard/(organization)/manage/invitations/components/invitations-columns"
import type { OrganizationInvitationItem } from "@/app/dashboard/(organization)/manage/invitations/lib/get-organization-invitations-page"
import {
  organizationInvitationsTablePath,
  type InvitationTableFilter,
} from "@/app/dashboard/(organization)/manage/invitations/lib/invitations-table-params"
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
import { Button } from "@repo/ui/components/button"
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

type InvitationsTableProps = {
  organizationId: string
  invitations: OrganizationInvitationItem[]
  page: number
  pageSize: number
  totalCount: number
  filter: InvitationTableFilter
  q?: string
  onInvite: () => void
}

const invitationFilters = [
  "all",
  "pending",
  "accepted",
  "rejected",
  "canceled",
] as const

export function InvitationsTable({
  organizationId,
  invitations,
  page,
  pageSize,
  totalCount,
  filter,
  q,
  onInvite,
}: InvitationsTableProps) {
  const locale = useLocale() as Locale
  const t = useTranslations()
  const tTables = useTranslations("tables")
  const tManage = useTranslations("dashboard.invitationManage")
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [cancelTarget, setCancelTarget] =
    useState<OrganizationInvitationItem | null>(null)

  const title = t("dashboard.manageTabs.invitations")
  const list = useList({
    buildPath: organizationInvitationsTablePath,
    page,
    pageSize,
    totalCount,
    filter,
    q,
    countLabel: tTables("count.invitations"),
  })

  const filterOptions = invitationFilters.map((value) => ({
    value,
    label: t(`tables.filters.${value}`),
  }))

  const columns = useMemo(
    () =>
      createInvitationsColumns({
        t: tTables,
        tManage,
        locale,
        disabled: isPending,
        onCancel: setCancelTarget,
      }),
    [isPending, locale, tManage, tTables]
  )

  const handleCancel = () => {
    if (!cancelTarget) return

    startTransition(async () => {
      const result = await cancelOrganizationInvitationAction({
        organizationId,
        invitationId: cancelTarget.id,
      })

      if (!result.success) {
        toast.add({
          title: result.error ?? tManage("cancelFailed"),
          type: "error",
        })
        return
      }

      setCancelTarget(null)
      toast.add({ title: tManage("canceled"), type: "success" })
      router.refresh()
    })
  }

  return (
    <>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardAction className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
            <Button
              type="button"
              className="w-full sm:w-auto"
              onClick={onInvite}
            >
              <PlusIcon />
              {tManage("invite")}
            </Button>
            <ListSearch
              value={q}
              placeholder={tTables("search.invitations")}
              onCommit={list.setQuery}
            />
            <Select
              items={filterOptions}
              value={filter}
              onValueChange={(next) => {
                if (next) list.setFilter(next)
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
            rows={invitations}
            columns={columns}
            getRowId={(row) => row.id}
            caption={title}
            busy={list.isPending}
            empty={
              q || filter !== "all"
                ? tTables("empty.results")
                : tTables("empty.invitations")
            }
          />
        </CardContent>
        <CardFooter className="justify-between gap-2">
          {totalCount > 0 ? <ListPagination {...list.pagination} /> : null}
        </CardFooter>
      </Card>

      <AlertDialog
        open={Boolean(cancelTarget)}
        onOpenChange={(open) => {
          if (!open) setCancelTarget(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{tManage("cancelTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelTarget
                ? tManage("cancelDescription", { email: cancelTarget.email })
                : null}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>
              {t("common.cancel")}
            </AlertDialogCancel>
            <AlertDialogAction disabled={isPending} onClick={handleCancel}>
              {tManage("cancelConfirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
