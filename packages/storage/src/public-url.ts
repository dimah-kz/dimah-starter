import { buildPublicObjectUrl } from "@dimah-s3/core"

function publicBaseUrl(): string | null {
  const base = process.env.S3_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "")
  return base || null
}

/**
 * Public URL for an object key, each path segment percent-encoded (a name
 * like `logo #1.png` stays one path). `null` when `S3_PUBLIC_BASE_URL` is
 * unset.
 */
export function toPublicUrl(key: string): string | null {
  const baseUrl = publicBaseUrl()
  return baseUrl ? buildPublicObjectUrl({ baseUrl, key }) : null
}

/**
 * Inverse of {@link toPublicUrl}: the decoded key. `null` when the URL is not
 * under our public base or does not decode.
 */
export function fromPublicUrl(url: string): string | null {
  const base = publicBaseUrl()
  if (!base) return null
  const prefix = `${base}/`
  if (!url.startsWith(prefix)) return null
  const path = url.slice(prefix.length).replace(/^\/+/, "")
  if (!path) return null
  try {
    return path.split("/").map(decodeURIComponent).join("/")
  } catch {
    return null
  }
}
