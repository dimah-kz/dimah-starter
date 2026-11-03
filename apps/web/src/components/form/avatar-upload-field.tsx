"use client"

import { useState } from "react"
import { XIcon } from "lucide-react"
import { useUpload } from "@dimah-s3/react"
import { AvatarUpload, UploadToasts } from "@dimah-s3/ui"
import { Avatar, AvatarImage } from "@repo/ui/components/avatar"
import { toast } from "@repo/ui/components/toast"
import { Button } from "@repo/ui/components/button"
import { cn } from "cn"

export type AvatarUploadLabels = {
  upload: string
  remove: string
  updated: string
  removed: string
}

type SetAvatarResult = { error: string } | { imageUrl: string }
type RemoveAvatarResult = { error: string } | { success: true }

type AvatarUploadFieldProps = {
  route: "avatar" | "logo"
  image: string | null
  objectKey: string | null
  setAction: (key: string) => Promise<SetAvatarResult>
  removeAction: () => Promise<RemoveAvatarResult>
  labels: AvatarUploadLabels
  shape?: "circle" | "square"
  className?: string
}

export function AvatarUploadField({
  route,
  image,
  objectKey: initialObjectKey,
  setAction,
  removeAction,
  labels,
  shape = "circle",
  className,
}: AvatarUploadFieldProps) {
  const [objectKey, setObjectKey] = useState(initialObjectKey)
  const [externalImage, setExternalImage] = useState(
    initialObjectKey ? null : image
  )
  const [removing, setRemoving] = useState(false)

  const upload = useUpload({
    route,
    disabled: removing,
  })

  const hasImage = Boolean(objectKey || externalImage)

  const onChange = async (result: { key: string }) => {
    const outcome = await setAction(result.key)
    if ("error" in outcome) {
      toast.add({ title: outcome.error, type: "error" })
      return
    }
    setObjectKey(result.key)
    setExternalImage(null)
    toast.add({ title: labels.updated, type: "success" })
  }

  const onRemove = async () => {
    setRemoving(true)
    try {
      const outcome = await removeAction()
      if ("error" in outcome) {
        toast.add({ title: outcome.error, type: "error" })
        return
      }
      setObjectKey(null)
      setExternalImage(null)
      toast.add({ title: labels.removed, type: "success" })
    } finally {
      setRemoving(false)
    }
  }

  return (
    <div className={cn("relative inline-flex", className)}>
      {externalImage ? (
        <Avatar
          className={cn(
            "pointer-events-none absolute inset-0 size-full after:hidden",
            shape === "square" && "rounded-xl after:rounded-xl"
          )}
        >
          <AvatarImage
            src={externalImage}
            alt=""
            className={shape === "square" ? "rounded-xl" : undefined}
          />
        </Avatar>
      ) : null}
      <AvatarUpload
        upload={upload}
        route={route}
        objectKey={objectKey}
        label={labels.upload}
        shape={shape}
        onChange={(result) => void onChange(result)}
        className={
          externalImage
            ? "[&_button]:bg-transparent [&_button>svg]:invisible"
            : undefined
        }
      />
      <UploadToasts upload={upload} />
      {hasImage && !upload.isPending && !removing ? (
        <Button
          type="button"
          size="icon-xs"
          variant="secondary"
          onClick={() => void onRemove()}
          className="absolute end-0.5 top-0.5 z-10 rounded-full"
          aria-label={labels.remove}
        >
          <XIcon className="size-3.5" />
        </Button>
      ) : null}
    </div>
  )
}
