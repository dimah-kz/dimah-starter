function publicBaseUrl(): string | null {
  const base = process.env.S3_PUBLIC_BASE_URL?.trim().replace(/\/+$/, "")
  return base || null
}

/** Public URL for an object key. `null` when `S3_PUBLIC_BASE_URL` is unset. */
export function toPublicUrl(key: string): string | null {
  const base = publicBaseUrl()
  if (!base) return null
  return `${base}/${key.replace(/^\/+/, "")}`
}

/** Inverse of {@link toPublicUrl}; `null` when the URL is not under our public base. */
export function fromPublicUrl(url: string): string | null {
  const base = publicBaseUrl()
  if (!base) return null
  const prefix = `${base}/`
  if (!url.startsWith(prefix)) return null
  const key = url.slice(prefix.length).replace(/^\/+/, "")
  return key || null
}
