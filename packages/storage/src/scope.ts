import type { DimahS3Locals } from "@dimah-s3/server"
import "./locals"

/** Who owns a route's objects. Each owner is one dimah-s3 scope. */
export type Owner = "user" | "organization"

/** Scope stored on each object row: `user:{id}` or `org:{id}`. */
export function toScope(owner: Owner, ownerId: string) {
  return owner === "organization" ? `org:${ownerId}` : `user:${ownerId}`
}

/** Scope of the caller for `owner`, or `null` when the session has none. */
export function toCallerScope(owner: Owner, locals: DimahS3Locals) {
  const ownerId =
    owner === "organization" ? locals.organizationId : locals.userId
  return ownerId ? toScope(owner, ownerId) : null
}
