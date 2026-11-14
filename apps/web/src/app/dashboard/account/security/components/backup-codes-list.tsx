"use client"

import { CopyIcon, DownloadIcon } from "lucide-react"
import { Button } from "@repo/ui/components/button"
import { toast } from "@repo/ui/components/toast"
import { useTranslations } from "next-intl"

type BackupCodesListProps = {
  codes: string[]
}

export function BackupCodesList({ codes }: BackupCodesListProps) {
  const t = useTranslations("account.twoFactor.codes")
  const text = codes.join("\n")

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text)
    toast.add({ title: t("copied"), type: "success" })
  }

  const handleDownload = () => {
    const url = URL.createObjectURL(
      new Blob([`${text}\n`], { type: "text/plain" })
    )
    const link = document.createElement("a")
    link.href = url
    link.download = t("fileName")
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col gap-3">
      <ul
        dir="ltr"
        className="grid grid-cols-2 gap-x-4 gap-y-1.5 rounded-lg bg-muted/60 p-4 font-mono text-sm tracking-wider ring-1 ring-foreground/5"
      >
        {codes.map((code) => (
          <li key={code} className="text-center">
            {code}
          </li>
        ))}
      </ul>
      <div className="grid grid-cols-2 gap-2">
        <Button type="button" variant="outline" onClick={handleCopy}>
          <CopyIcon data-icon="inline-start" aria-hidden />
          {t("copy")}
        </Button>
        <Button type="button" variant="outline" onClick={handleDownload}>
          <DownloadIcon data-icon="inline-start" aria-hidden />
          {t("download")}
        </Button>
      </div>
    </div>
  )
}
