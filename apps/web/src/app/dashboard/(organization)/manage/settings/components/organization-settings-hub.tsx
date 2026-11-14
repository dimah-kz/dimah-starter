"use client"

import { useId, useState, useTransition } from "react"
import { ChevronRightIcon } from "lucide-react"
import { updateOrganizationNameAction } from "@/app/action/dashboard/(organization)/manage/settings/update-organization-name-action"
import { OrganizationProfileFormFields } from "@/app/dashboard/(organization)/manage/settings/components/organization-profile-form-fields"
import type { OrganizationBranding } from "@/app/dashboard/(organization)/manage/settings/lib/get-active-organization-branding"
import { ResponsiveFormOverlay } from "@/components/form/responsive-form-overlay"
import { SettingsSection } from "@/components/settings/settings-section"
import { Button } from "@repo/ui/components/button"
import {
  Identity,
  IdentityAvatar,
  IdentityContent,
  IdentityDescription,
  IdentityTitle,
} from "@repo/ui/components/dimah/identity"
import { Item, ItemActions } from "@repo/ui/components/item"
import { toast } from "@repo/ui/components/toast"
import { useTranslations } from "next-intl"

type OrganizationSettingsHubProps = {
  organization: OrganizationBranding & { logoKey: string | null }
  canEdit: boolean
}

export function OrganizationSettingsHub({
  organization,
  canEdit,
}: OrganizationSettingsHubProps) {
  const t = useTranslations("dashboard.organizationSettings")
  const tCommon = useTranslations("common")
  const formId = useId()
  const [profileOpen, setProfileOpen] = useState(false)
  const [isSaving, startSaveTransition] = useTransition()

  const handleSave = (formData: FormData) => {
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
            />
          </form>
        </ResponsiveFormOverlay>
      ) : null}
    </>
  )
}
