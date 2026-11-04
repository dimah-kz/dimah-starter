/**
 * dimah-s3 schema 2.1.0 (`@dimah-s3/db` 2.0 beta).
 * Column names and `dimahS3Tables` keys match `src/drizzle/pg.ts` in that
 * package. Tables live in PostgreSQL schema `storage` (this database keeps
 * `auth` and `storage` out of `public`). Diff against the package file when
 * upgrading dimah-s3.
 *
 * @see https://s3.dimah.dev/docs/db/setup
 */
import { createId } from "@paralleldrive/cuid2"
import { defineRelationsPart, sql } from "drizzle-orm"
import {
  bigint,
  index,
  json,
  pgSchema,
  text,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core"

type StorageObjectStatus = "pending" | "active" | "deleted" | "purging"

const SCHEMA_VERSION = "2.1.0"

function id() {
  return varchar("id", { length: 255 })
    .primaryKey()
    .$defaultFn(() => createId())
}

function timestampNow(name: string) {
  return timestamp(name)
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`)
    .$defaultFn(() => new Date())
}

function byteCount(name: string) {
  return bigint(name, { mode: "number" })
}

/** PostgreSQL schema for dimah-s3 tables (not `public`). */
export const storagePg = pgSchema("storage")

/** One row per tracked object. */
export const storageObject = storagePg.table(
  "storage_object",
  {
    id: id(),
    scope: text("scope").notNull(),
    bucket: text("bucket").notNull(),
    key: text("key").notNull(),
    route: text("route").notNull(),
    folderId: text("folder_id"),
    filename: text("filename").notNull(),
    contentType: text("content_type"),
    size: byteCount("size"),
    declaredSize: byteCount("declared_size"),
    eTag: text("e_tag"),
    status: text("status").$type<StorageObjectStatus>().notNull(),
    s3Metadata: json("s3_metadata").$type<Record<string, string>>(),
    attributes: json("attributes"),
    acl: text("acl"),
    uploadId: text("upload_id"),
    uploadToken: text("upload_token"),
    expiresAt: timestamp("expires_at"),
    confirmedAt: timestamp("confirmed_at"),
    createdAt: timestampNow("created_at"),
    updatedAt: timestampNow("updated_at"),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    unique("storage_object_bucket_key_uk").on(table.bucket, table.key),
    index("storage_object_scope_folder_idx").on(
      table.scope,
      table.status,
      table.folderId,
      table.createdAt
    ),
    index("storage_object_scope_updated_idx").on(
      table.scope,
      table.status,
      table.updatedAt
    ),
    index("storage_object_scope_filename_idx").on(
      table.scope,
      table.status,
      table.filename
    ),
    index("storage_object_scope_size_idx").on(
      table.scope,
      table.status,
      table.size
    ),
    index("storage_object_status_expires_idx").on(
      table.status,
      table.expiresAt
    ),
  ]
)

/** One row per folder, so an empty folder still lists. */
export const storageFolder = storagePg.table(
  "storage_folder",
  {
    id: id(),
    scope: text("scope").notNull(),
    /** `""` is the root. */
    parentId: text("parent_id").notNull().default(""),
    name: text("name").notNull(),
    path: text("path").notNull(),
    createdAt: timestampNow("created_at"),
    updatedAt: timestampNow("updated_at"),
  },
  (table) => [
    unique("storage_folder_scope_path_uk").on(table.scope, table.path),
    unique("storage_folder_scope_parent_name_uk").on(
      table.scope,
      table.parentId,
      table.name
    ),
  ]
)

/**
 * FumaDB settings. The Drizzle adapter reads the schema version from the
 * default of the `version` field (SQL column `value`).
 */
export const private_dimah_s3_settings = storagePg.table(
  "private_dimah_s3_settings",
  {
    key: varchar("key", { length: 255 }).primaryKey(),
    version: text("value").notNull().default(SCHEMA_VERSION),
  }
)

/** Keys the FumaDB Drizzle adapter looks up. Do not rename them. */
export const dimahS3Tables = {
  storageObject,
  storageFolder,
  private_dimah_s3_settings,
}

/** Registers storage tables for Drizzle RQB. No cross-schema relations. */
export const storageRelations = defineRelationsPart(dimahS3Tables)
