"use client"

import { Fragment, useId, useState, useTransition } from "react"
import {
  CloudIcon,
  FingerprintIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
} from "lucide-react"
import {
  browserSupportsWebAuthn,
  startRegistration,
  WebAuthnError,
} from "@simplewebauthn/browser"
import { addPasskeyAction } from "@/app/action/dashboard/account/add-passkey-action"
import { deletePasskeyAction } from "@/app/action/dashboard/account/delete-passkey-action"
import { renamePasskeyAction } from "@/app/action/dashboard/account/rename-passkey-action"
import { startPasskeyRegistrationAction } from "@/app/action/dashboard/account/start-passkey-registration-action"
import type { AccountSecurity } from "@/app/dashboard/account/lib/get-account-security"
import { LabeledBadge } from "@/components/badge/labeled-badge"
import { NAME_MAX_LENGTH } from "@/components/form/form-parse"
import { SettingsCard } from "@/components/settings/settings-card"
import { isPasskeyPromptDismissed } from "@/lib/passkey-prompt"
import { useCloseOnHide } from "@/lib/use-close-on-hide"
import { formatDate, resolveLocale } from "@repo/i18n"
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog"
import { Field, FieldLabel } from "@repo/ui/components/field"
import { Input } from "@repo/ui/components/input"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemSeparator,
  ItemTitle,
} from "@repo/ui/components/item"
import { IconTile } from "@repo/ui/components/reui/icon-tile"
import { toast } from "@repo/ui/components/toast"
import { useLocale, useTranslations } from "next-intl"

type AccountPasskey = AccountSecurity["passkeys"][number]

type AccountPasskeysCardProps = {
  passkeys: AccountPasskey[]
}

export function AccountPasskeysCard({ passkeys }: AccountPasskeysCardProps) {
  const t = useTranslations("account.passkeys")
  const locale = resolveLocale(useLocale())
  const [isAdding, startAdding] = useTransition()
  const [renaming, setRenaming] = useState<AccountPasskey | null>(null)
  const [removing, setRemoving] = useState<AccountPasskey | null>(null)
  const nameOf = (passkey: AccountPasskey) => passkey.name ?? t("unnamed")

  const handleAdd = () => {
    startAdding(async () => {
      if (!browserSupportsWebAuthn()) {
        toast.add({ title: t("unsupported"), type: "error" })
        return
      }

      const started = await startPasskeyRegistrationAction()
      if (!started.success) {
        toast.add({ title: started.error ?? t("addFailed"), type: "error" })
        return
      }

      let response
      try {
        response = await startRegistration({ optionsJSON: started.options })
      } catch (error) {
        if (!isPasskeyPromptDismissed(error)) {
          const exists =
            error instanceof WebAuthnError &&
            error.code === "ERROR_AUTHENTICATOR_PREVIOUSLY_REGISTERED"
          toast.add({
            title: exists ? t("exists") : t("addFailed"),
            type: "error",
          })
        }
        return
      }

      const result = await addPasskeyAction(response)
      if (!result.success) {
        toast.add({ title: result.error ?? t("addFailed"), type: "error" })
        return
      }

      toast.add({ title: t("added"), type: "success" })
    })
  }

  return (
    <>
      <SettingsCard
        title={t("title")}
        description={t("description")}
        hint={t("hint")}
        actions={
          <Button type="button" disabled={isAdding} onClick={handleAdd}>
            <PlusIcon data-icon="inline-start" aria-hidden />
            {isAdding ? t("adding") : t("add")}
          </Button>
        }
      >
        {passkeys.length ? (
          <ItemGroup className="gap-0 rounded-lg ring-1 ring-foreground/10">
            {passkeys.map((passkey, index) => {
              const name = nameOf(passkey)

              return (
                <Fragment key={passkey.id}>
                  {index > 0 ? <ItemSeparator className="my-0" /> : null}
                  <Item size="sm">
                    <ItemMedia>
                      <IconTile variant="outline" size="sm">
                        <FingerprintIcon aria-hidden />
                      </IconTile>
                    </ItemMedia>
                    <ItemContent className="min-w-0">
                      <ItemTitle className="text-sm">
                        <span className="truncate">{name}</span>
                        {passkey.backedUp ? (
                          <LabeledBadge
                            variant="outline"
                            icon={<CloudIcon aria-hidden />}
                            label={t("synced")}
                          />
                        ) : null}
                      </ItemTitle>
                      {passkey.createdAt ? (
                        <ItemDescription>
                          {t("addedOn", {
                            date: formatDate(passkey.createdAt, locale),
                          })}
                        </ItemDescription>
                      ) : null}
                    </ItemContent>
                    <ItemActions className="gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={t("rename", { name })}
                        onClick={() => setRenaming(passkey)}
                      >
                        <PencilIcon />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={t("remove", { name })}
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => setRemoving(passkey)}
                      >
                        <Trash2Icon />
                      </Button>
                    </ItemActions>
                  </Item>
                </Fragment>
              )
            })}
          </ItemGroup>
        ) : (
          <p className="rounded-lg border border-dashed px-4 py-5 text-center text-sm text-muted-foreground">
            {t("empty")}
          </p>
        )}
      </SettingsCard>

      <RenamePasskeyDialog
        passkey={renaming}
        onClose={() => setRenaming(null)}
      />
      <RemovePasskeyDialog
        passkey={removing}
        onClose={() => setRemoving(null)}
      />
    </>
  )
}

type PasskeyDialogProps = {
  passkey: AccountPasskey | null
  onClose: () => void
}

/** The passkey to show: the last one opened, so a closing dialog keeps it. */
function useShownPasskey(passkey: AccountPasskey | null) {
  const t = useTranslations("account.passkeys")
  const [shown, setShown] = useState(passkey)
  if (passkey && passkey !== shown) {
    setShown(passkey)
  }
  return { shown, name: shown?.name ?? t("unnamed") }
}

function RenamePasskeyDialog({ passkey, onClose }: PasskeyDialogProps) {
  const t = useTranslations("account.passkeys")
  const tCommon = useTranslations("common")
  const { shown, name } = useShownPasskey(passkey)
  const formId = useId()
  const [isPending, startTransition] = useTransition()
  const open = passkey !== null

  useCloseOnHide(open, onClose)

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isPending) {
          onClose()
        }
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("renameTitle")}</DialogTitle>
          <DialogDescription>{t("renameDescription")}</DialogDescription>
        </DialogHeader>
        <form
          id={formId}
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            const formData = new FormData(event.currentTarget)

            startTransition(async () => {
              const result = await renamePasskeyAction(formData)

              if (!result.success) {
                toast.add({
                  title: result.error ?? t("renameFailed"),
                  type: "error",
                })
                return
              }

              toast.add({ title: t("renamed"), type: "success" })
              onClose()
            })
          }}
        >
          <input type="hidden" name="id" value={shown?.id ?? ""} />
          <Field>
            <FieldLabel htmlFor={`${formId}-name`}>{t("nameLabel")}</FieldLabel>
            {/* Keyed so each passkey opens with its own name. */}
            <Input
              key={shown?.id}
              id={`${formId}-name`}
              name="name"
              defaultValue={name}
              maxLength={NAME_MAX_LENGTH}
              autoComplete="off"
              autoFocus
              required
            />
          </Field>
        </form>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={onClose}
          >
            {tCommon("cancel")}
          </Button>
          <Button type="submit" form={formId} disabled={isPending}>
            {isPending ? t("saving") : t("save")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function RemovePasskeyDialog({ passkey, onClose }: PasskeyDialogProps) {
  const t = useTranslations("account.passkeys")
  const tCommon = useTranslations("common")
  const { shown, name } = useShownPasskey(passkey)
  const [isPending, startTransition] = useTransition()
  const open = passkey !== null

  useCloseOnHide(open, onClose)

  const handleRemove = () => {
    if (!shown) {
      return
    }

    startTransition(async () => {
      const result = await deletePasskeyAction(shown.id)

      if (!result.success) {
        toast.add({ title: result.error ?? t("removeFailed"), type: "error" })
        return
      }

      toast.add({ title: t("removed"), type: "success" })
      onClose()
    })
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isPending) {
          onClose()
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("removeTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("removeDescription", { name })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {tCommon("cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={handleRemove}
          >
            {isPending ? t("removing") : t("removeConfirm")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
