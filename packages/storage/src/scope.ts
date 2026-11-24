import type { ScopeOperation } from "@dimah-s3/db"
import type { DimahS3Locals } from "@dimah-s3/server"

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

/**
 * What a caller may do through `db()`, by operation. Nothing renames objects
 * (`update` is `PATCH /db/object`), uses folders, or runs a plugin built on
 * db, such as share links. A flat list stays allowed: cleanup lists a scope
 * with no folder. Every operation is named, so one a dimah-s3 upgrade adds
 * fails typecheck until it is decided here.
 */
const dbOperations = {
  upload: true,
  confirm: true,
  multipart: true,
  download: true,
  delete: true,
  list: true,
  read: true,
  record: true,
  update: false,
  "folder.create": false,
  "folder.update": false,
  "folder.delete": false,
  plugin: false,
} satisfies Record<ScopeOperation, boolean>

/** `db()` `authorize`: whether the caller's scope may run `operation`. */
export function isAllowedDbOperation(operation: ScopeOperation) {
  return dbOperations[operation]
}
