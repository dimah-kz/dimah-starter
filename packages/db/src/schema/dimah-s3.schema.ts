import {
  varchar,
  bigint,
  json,
  text,
  timestamp,
  unique,
  index,
  pgSchema,
  pgTable,
} from "drizzle-orm/pg-core"
import { defineRelations } from "drizzle-orm"

export const storageSchema = pgSchema("storage")

export const storageObject = storageSchema.table(
  "storage_object",
  {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    scope: varchar("scope", { length: 255 }).notNull(),
    bucket: varchar("bucket", { length: 255 }).notNull(),
    key: varchar("key", { length: 1024 }).notNull(),
    route: varchar("route", { length: 255 }).notNull(),
    folderId: varchar("folder_id", { length: 255 }),
    filename: varchar("filename", { length: 255 }).notNull(),
    contentType: varchar("content_type", { length: 255 }),
    size: bigint("size", { mode: "bigint" }),
    declaredSize: bigint("declared_size", { mode: "bigint" }),
    eTag: varchar("e_tag", { length: 255 }),
    status: varchar("status", { length: 16 }).notNull(),
    s3Metadata: json("s3_metadata"),
    attributes: json("attributes"),
    acl: varchar("acl", { length: 255 }),
    uploadId: text("upload_id"),
    uploadToken: varchar("upload_token", { length: 64 }),
    expiresAt: timestamp("expires_at"),
    confirmedAt: timestamp("confirmed_at"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
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

export const storageFolder = storageSchema.table(
  "storage_folder",
  {
    id: varchar("id", { length: 255 }).primaryKey().notNull(),
    scope: varchar("scope", { length: 255 }).notNull(),
    parentId: varchar("parent_id", { length: 255 }).notNull().default(""),
    name: varchar("name", { length: 255 }).notNull(),
    path: varchar("path", { length: 1024 }).notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
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

export const private_dimah_s3_settings = pgTable("private_dimah_s3_settings", {
  key: varchar("key", { length: 255 }).primaryKey().notNull(),
  version: text("value").notNull().default("2.1.0"),
})

export const relations = defineRelations({
  storageObject,
  storageFolder,
  private_dimah_s3_settings,
})
