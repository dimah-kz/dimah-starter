"use client"

import { useState } from "react"
import { XIcon } from "lucide-react"
import { useUpload } from "@dimah-s3/react"
import { AvatarUpload, UploadToasts } from "@dimah-s3/ui"
import { Avatar, AvatarImage } from "@repo/ui/components/avatar"
import { toast } from "@repo/ui/components/toast"
import { Button } from "@repo/ui/components/button"
import type { RouteName } from "@repo/storage"
import { cn } from "cn"

type ActionResult = { success: boolean; error?: string }

type AvatarUploadFieldProps = {
  route: RouteName
  image: string | null
  objectKey: string | null
  setAction: (key: string) => Promise<ActionResult>
  removeAction: () => Promise<ActionResult>
  labels: {
    upload: string
    remove: string
    updated: string
    removed: string
    uploadFailed: string
    removeFailed: string
  }
  shape?: "circle" | "square"
}

export function AvatarUploadField({
  route,
  image,
  objectKey: initialObjectKey,
  setAction,
  removeAction,
  labels,
  shape = "circle",
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
    const outcome = await setAction(result.key).catch(() => null)
    if (!outcome?.success) {
      toast.add({
        title: outcome?.error ?? labels.uploadFailed,
        type: "error",
      })
      return
    }
    setObjectKey(result.key)
    setExternalImage(null)
    toast.add({ title: labels.updated, type: "success" })
  }

  const onRemove = async () => {
    setRemoving(true)
    const outcome = await removeAction().catch(() => null)
    setRemoving(false)
    if (!outcome?.success) {
      toast.add({
        title: outcome?.error ?? labels.removeFailed,
        type: "error",
      })
      return
    }
    setObjectKey(null)
    setExternalImage(null)
    toast.add({ title: labels.removed, type: "success" })
  }

  return (
    <div className="relative inline-flex">
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
