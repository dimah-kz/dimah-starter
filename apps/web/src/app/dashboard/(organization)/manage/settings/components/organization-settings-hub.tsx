"use client"

import { useId, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { ChevronRightIcon, Trash2Icon } from "lucide-react"
import { deleteOrganizationAction } from "@/app/action/dashboard/(organization)/manage/delete-organization-action"
import { updateOrganizationNameAction } from "@/app/action/dashboard/(organization)/manage/update-organization-name-action"
import { OrganizationProfileFormFields } from "@/app/dashboard/(organization)/manage/settings/components/organization-profile-form-fields"
import type { OrganizationBranding } from "@/app/dashboard/(organization)/manage/settings/lib/get-active-organization-branding"
import { dashboardRoutes } from "@/app/dashboard/lib/dashboard-routes"
import { ResponsiveFormOverlay } from "@/components/form/responsive-form-overlay"
import { SettingsSection } from "@/components/settings/settings-section"
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
  Identity,
  IdentityAvatar,
  IdentityContent,
  IdentityDescription,
  IdentityTitle,
} from "@repo/ui/components/dimah/identity"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from "@repo/ui/components/item"
import { IconTile } from "@repo/ui/components/reui/icon-tile"
import { toast } from "@repo/ui/components/toast"
import { useTranslations } from "next-intl"

type OrganizationSettingsHubProps = {
  organization: OrganizationBranding
  canEdit: boolean
  canDelete: boolean
}

export function OrganizationSettingsHub({
  organization,
  canEdit,
  canDelete,
}: OrganizationSettingsHubProps) {
  const t = useTranslations("dashboard.organizationSettings")
  const tCommon = useTranslations("common")
  const router = useRouter()
  const formId = useId()
  const [profileOpen, setProfileOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [isSaving, startSaveTransition] = useTransition()
  const [isDeleting, startDeleteTransition] = useTransition()

  const handleSave = (formData: FormData) => {
    if (!canEdit) {
      return
    }

    const name = String(formData.get("name") ?? "").trim()
    if (!name) {
      return
    }

    startSaveTransition(async () => {
      const result = await updateOrganizationNameAction({
        organizationId: organization.id,
        name,
      })

      if (!result.success) {
        toast.add({
          title: result.error ?? t("profile.saveFailed"),
          type: "error",
        })
        return
      }

      toast.add({ title: t("profile.saved"), type: "success" })
      setProfileOpen(false)
      router.refresh()
    })
  }

  const handleDelete = () => {
    startDeleteTransition(async () => {
      const result = await deleteOrganizationAction({
        organizationId: organization.id,
      })

      if (!result.success) {
        toast.add({
          title: result.error ?? t("delete.failed"),
          type: "error",
        })
        return
      }

      toast.add({ title: t("delete.deleted"), type: "success" })
      setDeleteOpen(false)
      router.push(result.redirectTo ?? dashboardRoutes.home())
      router.refresh()
    })
  }

  return (
    <>
      <div className="flex w-full max-w-xl flex-col gap-6">
        <SettingsSection label={t("sections.general")}>
          <Item
            className={
              canEdit ? "rounded-none hover:bg-muted/50" : "rounded-none"
            }
            role="listitem"
            render={
              canEdit ? (
                <button
                  type="button"
                  className="flex w-full min-w-0 items-center gap-2.5 text-start"
                  onClick={() => setProfileOpen(true)}
                />
              ) : undefined
            }
          >
            <Identity size="lg" className="w-auto flex-1">
              <IdentityAvatar
                src={organization.logo}
                name={organization.name}
              />
              <IdentityContent>
                <IdentityTitle>{organization.name}</IdentityTitle>
                <IdentityDescription>{organization.slug}</IdentityDescription>
              </IdentityContent>
            </Identity>
            {canEdit ? (
              <ItemActions className="shrink-0 text-muted-foreground">
                <ChevronRightIcon
                  className="size-4 rtl:rotate-180"
                  aria-hidden
                />
              </ItemActions>
            ) : null}
          </Item>
        </SettingsSection>

        {canDelete ? (
          <SettingsSection label={t("sections.delete")}>
            <Item
              className="rounded-none hover:bg-destructive/5"
              role="listitem"
              render={
                <button
                  type="button"
                  className="flex w-full min-w-0 items-center gap-2.5 text-start"
                  onClick={() => setDeleteOpen(true)}
                />
              }
            >
              <ItemMedia>
                <IconTile variant="soft" size="sm" className="text-destructive">
                  <Trash2Icon aria-hidden />
                </IconTile>
              </ItemMedia>
              <ItemContent className="min-w-0">
                <ItemTitle className="text-sm text-destructive">
                  {t("delete.title")}
                </ItemTitle>
                <ItemDescription>{t("delete.navDescription")}</ItemDescription>
              </ItemContent>
              <ItemActions className="shrink-0 text-destructive/60">
                <ChevronRightIcon
                  className="size-4 rtl:rotate-180"
                  aria-hidden
                />
              </ItemActions>
            </Item>
          </SettingsSection>
        ) : null}
      </div>

      {canEdit ? (
        <ResponsiveFormOverlay
          open={profileOpen}
          onOpenChange={(nextOpen) => {
            if (!nextOpen && !isSaving) {
              setProfileOpen(false)
            }
          }}
          title={t("profile.title")}
          description={t("profile.description")}
          footer={
            <>
              <Button type="submit" form={formId} disabled={isSaving}>
                {isSaving ? t("profile.saving") : t("profile.save")}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isSaving}
                onClick={() => setProfileOpen(false)}
              >
                {tCommon("cancel")}
              </Button>
            </>
          }
        >
          <form
            id={formId}
            noValidate
            className="flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              handleSave(new FormData(event.currentTarget))
            }}
          >
            <OrganizationProfileFormFields
              formId={formId}
              organization={organization}
              canEdit={canEdit}
            />
          </form>
        </ResponsiveFormOverlay>
      ) : null}

      {canDelete ? (
        <AlertDialog
          open={deleteOpen}
          onOpenChange={(open) => {
            if (!open && !isDeleting) {
              setDeleteOpen(false)
            }
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t("delete.confirmTitle")}</AlertDialogTitle>
              <AlertDialogDescription>
                {t("delete.confirmDescription", { name: organization.name })}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeleting}>
                {tCommon("cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                disabled={isDeleting}
                onClick={handleDelete}
              >
                {isDeleting ? t("delete.deleting") : t("delete.confirm")}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : null}
    </>
  )
}
