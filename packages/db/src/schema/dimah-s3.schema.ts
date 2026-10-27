/**
 * dimah-s3 / FumaDB tables (PostgreSQL schema `storage`, not `public`).
 * Shape matches `@dimah-s3/db` v1 (including `route`) + recommended secondary indexes.
 *
 * @see https://dimah-s3.vercel.app/docs/db/setup
 */
import { createId } from "@paralleldrive/cuid2"
import { defineRelationsPart } from "drizzle-orm"
import {
  bigint,
  index,
  json,
  snakeCase,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core"

/** PostgreSQL schema for dimah-s3 tables (not `public`). */
export const storagePg = snakeCase.schema("storage")

export const storageObject = storagePg.table(
  "storage_object",
  {
    id: varchar({ length: 255 })
      .primaryKey()
      .notNull()
      .$defaultFn(() => createId()),
    scope: text().notNull(),
    bucket: text().notNull(),
    key: text().notNull(),
    /** Named dimah-s3 route that created the object. */
    route: text().notNull().default("avatars"),
    contentType: text(),
    size: bigint({ mode: "bigint" }),
    eTag: text(),
    filename: text(),
    status: text().notNull(),
    metadata: json(),
    acl: text(),
    uploadId: text(),
    declaredSize: bigint({ mode: "bigint" }),
    confirmedAt: timestamp(),
    expiresAt: timestamp(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow(),
    deletedAt: timestamp(),
  },
  (table) => [
    uniqueIndex("storage_object_bucket_key_uk").on(table.bucket, table.key),
    index("storage_object_scope_status_created_idx").on(
      table.scope,
      table.status,
      table.createdAt
    ),
    index("storage_object_status_expires_idx").on(
      table.status,
      table.expiresAt
    ),
    index("storage_object_status_created_idx").on(
      table.status,
      table.createdAt
    ),
  ]
)

/** FumaDB settings row — emitted by CLI alongside `storage_object`. */
export const private_dimah_s3_settings = storagePg.table(
  "private_dimah_s3_settings",
  {
    id: varchar({ length: 255 }).primaryKey().notNull(),
    version: varchar({ length: 255 }).notNull().default("1.0.0"),
  }
)

/** Registers storage tables for Drizzle RQB / FumaDB — no cross-schema relations. */
export const storageRelations = defineRelationsPart({
  storageObject,
  private_dimah_s3_settings,
})
