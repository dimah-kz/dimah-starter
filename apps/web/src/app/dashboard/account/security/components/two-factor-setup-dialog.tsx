"use client"

import { useId, useState, useTransition } from "react"
import { CopyIcon } from "lucide-react"
import { confirmTwoFactorAction } from "@/app/action/dashboard/account/confirm-two-factor-action"
import { enableTwoFactorAction } from "@/app/action/dashboard/account/enable-two-factor-action"
import { BackupCodesList } from "@/app/dashboard/account/security/components/backup-codes-list"
import { QrCode } from "@/app/dashboard/account/security/components/qr-code"
import { OneTimeCodeInput } from "@/components/form/one-time-code-input"
import { PasswordInput } from "@/components/form/password-input"
import { useCloseOnHide } from "@/lib/use-close-on-hide"
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
import { toast } from "@repo/ui/components/toast"
import { cn } from "cn"
import { useTranslations } from "next-intl"

type SetupStep =
  | { name: "password" }
  | { name: "verify"; totpURI: string; backupCodes: string[] }
  | { name: "codes"; backupCodes: string[] }

const stepOrder = ["password", "verify", "codes"] as const

type TwoFactorSetupDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Password, then a code from the newly scanned app, then the backup codes.
 * Two-factor turns on at the second step; closing earlier leaves it off.
 */
export function TwoFactorSetupDialog({
  open,
  onOpenChange,
}: TwoFactorSetupDialogProps) {
  const t = useTranslations("account.twoFactor")
  const tCommon = useTranslations("common")
  const formId = useId()
  const [step, setStep] = useState<SetupStep>({ name: "password" })
  const [password, setPassword] = useState("")
  const [code, setCode] = useState("")
  const [isPending, startTransition] = useTransition()

  // Start over on each opening, not on close: the closing dialog keeps its
  // last step while it fades out.
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setStep({ name: "password" })
      setPassword("")
      setCode("")
    }
  }

  const close = () => onOpenChange(false)

  useCloseOnHide(open, close)

  const submitPassword = () => {
    startTransition(async () => {
      const result = await enableTwoFactorAction(password)

      if (!result.success) {
        toast.add({ title: result.error ?? t("setup.started"), type: "error" })
        return
      }

      setPassword("")
      setStep({
        name: "verify",
        totpURI: result.totpURI,
        backupCodes: result.backupCodes,
      })
    })
  }

  const submitCode = (value: string) => {
    if (step.name !== "verify" || value.length < 6) {
      return
    }

    startTransition(async () => {
      const result = await confirmTwoFactorAction(value)

      if (!result.success) {
        toast.add({
          title: result.error ?? t("setup.invalidCode"),
          type: "error",
        })
        setCode("")
        return
      }

      setStep({ name: "codes", backupCodes: step.backupCodes })
    })
  }

  const description =
    step.name === "password"
      ? t("setup.passwordStep")
      : step.name === "verify"
        ? t("setup.scanStep")
        : t("setup.codesStep")

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen && !isPending) {
          close()
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gap-3">
          <SetupProgress current={step.name} />
          <DialogTitle>{t("setup.title")}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <form
          id={formId}
          noValidate
          onSubmit={(event) => {
            event.preventDefault()
            if (step.name === "password") {
              submitPassword()
            } else {
              submitCode(code)
            }
          }}
        >
          {step.name === "password" ? (
            <Field>
              <FieldLabel htmlFor={`${formId}-password`}>
                {t("password")}
              </FieldLabel>
              <PasswordInput
                id={`${formId}-password`}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoFocus
                required
              />
            </Field>
          ) : null}

          {step.name === "verify" ? (
            <div className="flex flex-col items-center gap-4">
              <QrCode value={step.totpURI} label={t("setup.qrLabel")} />
              <ManualKey totpURI={step.totpURI} />
              <Field className="items-center">
                <FieldLabel htmlFor={`${formId}-code`} className="self-center">
                  {t("setup.code")}
                </FieldLabel>
                <OneTimeCodeInput
                  id={`${formId}-code`}
                  value={code}
                  onChange={setCode}
                  onComplete={submitCode}
                  disabled={isPending}
                  autoFocus
                />
              </Field>
            </div>
          ) : null}

          {step.name === "codes" ? (
            <BackupCodesList codes={step.backupCodes} />
          ) : null}
        </form>

        <DialogFooter>
          {step.name === "codes" ? (
            <Button type="button" onClick={close}>
              {t("setup.done")}
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={close}
              >
                {tCommon("cancel")}
              </Button>
              <Button
                type="submit"
                form={formId}
                disabled={
                  isPending ||
                  (step.name === "password" ? !password : code.length < 6)
                }
              >
                {step.name === "password"
                  ? isPending
                    ? t("checking")
                    : t("continue")
                  : isPending
                    ? t("setup.verifying")
                    : t("setup.verify")}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function SetupProgress({ current }: { current: SetupStep["name"] }) {
  const index = stepOrder.indexOf(current)

  return (
    <ol className="flex gap-1.5 pe-8" aria-hidden>
      {stepOrder.map((name, position) => (
        <li
          key={name}
          className={cn(
            "h-1 flex-1 rounded-full transition-colors",
            position <= index ? "bg-primary" : "bg-muted"
          )}
        />
      ))}
    </ol>
  )
}

/** The secret from the `otpauth://` URI, in groups of four for typing. */
function ManualKey({ totpURI }: { totpURI: string }) {
  const t = useTranslations("account.twoFactor.setup")
  const secret = new URL(totpURI).searchParams.get("secret") ?? ""

  return (
    <div className="flex w-full flex-col gap-1.5 text-center">
      <p className="text-xs text-muted-foreground">{t("manualKey")}</p>
      <div className="flex items-center justify-center gap-1">
        <code
          dir="ltr"
          className="rounded-md bg-muted px-2 py-1 font-mono text-xs tracking-wider break-all"
        >
          {secret.match(/.{1,4}/g)?.join(" ")}
        </code>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t("copyKey")}
          onClick={async () => {
            await navigator.clipboard.writeText(secret)
            toast.add({ title: t("keyCopied"), type: "success" })
          }}
        >
          <CopyIcon />
        </Button>
      </div>
    </div>
  )
}
