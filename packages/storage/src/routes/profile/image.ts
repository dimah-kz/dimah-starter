import { fromPublicUrl } from "../../keys"

const imageCacheControl = "public, max-age=31536000, immutable"

/** Shared limits for profile images. Routes still decide the folder and owner. */
export const imageUpload = {
  fileTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  maxFileSize: 2 * 1024 * 1024,
  verifyContent: true,
}

/** Key already stored for this owner, when the URL is one of ours. */
function previousOwnedKey(url: string | null | undefined, folder: string) {
  if (!url) return
  const key = fromPublicUrl(url)
  if (!key || (key !== folder && !key.startsWith(`${folder}/`))) return
  return key
}

export function imageObject(
  routeName: string,
  folder: string,
  previousUrl: string | null | undefined
) {
  return {
    keyFolder: folder,
    cacheControl: imageCacheControl,
    previousKey: previousOwnedKey(previousUrl, `${routeName}/${folder}`),
  }
}
