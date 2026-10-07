const DEV_ORIGIN = "http://localhost:3000"

export function appOrigin() {
  const configured = process.env.BETTER_AUTH_URL?.trim().replace(/\/+$/, "")

  if (configured) {
    return configured
  }

  if (process.env.NODE_ENV !== "production") {
    return DEV_ORIGIN
  }

  throw new Error("BETTER_AUTH_URL is not set")
}

export function toAbsoluteAppUrl(path: string) {
  return new URL(path, `${appOrigin()}/`).href
}
