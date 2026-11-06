import { s3Error } from "@dimah-s3/server"

/** Shared limits for profile images. Routes still decide the owner. */
export const imageUpload = {
  fileTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  maxFileSize: 2 * 1024 * 1024,
  verifyContent: true,
}

/**
 * Keys stay under the owner's folder (`avatar/{userId}/{uuid}/{name}`). Each
 * upload gets a new key, so its public URL can be cached forever.
 */
export function imageObject(ownerId: string | null | undefined) {
  if (!ownerId) throw s3Error("FORBIDDEN")
  return {
    keyFolder: ownerId,
    cacheControl: "public, max-age=31536000, immutable",
  }
}
