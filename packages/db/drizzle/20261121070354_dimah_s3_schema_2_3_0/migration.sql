-- dimah-s3 schema 2.3.0. `filename` becomes `name` and `e_tag` becomes `etag`.
-- `route` shrinks to varchar(64) and `acl` to varchar(16); stored values already fit
-- (`avatar`/`logo`, and `private`/`public-read`). The name index moves onto `search_name`.
-- A folder path is a lookup index, not a unique key. Existing `search_name` values stay.
ALTER TABLE "storage"."storage_object" RENAME COLUMN "filename" TO "name";--> statement-breakpoint
ALTER TABLE "storage"."storage_object" RENAME COLUMN "e_tag" TO "etag";--> statement-breakpoint
ALTER TABLE "storage"."storage_folder" DROP CONSTRAINT "storage_folder_scope_path_uk";--> statement-breakpoint
DROP INDEX "storage"."storage_object_scope_filename_idx";--> statement-breakpoint
ALTER TABLE "private_dimah_s3_settings" ALTER COLUMN "value" SET DEFAULT '2.3.0';--> statement-breakpoint
UPDATE "private_dimah_s3_settings" SET "value" = '2.3.0' WHERE "key" = 'version';--> statement-breakpoint
ALTER TABLE "storage"."storage_object" ALTER COLUMN "route" SET DATA TYPE varchar(64) USING "route"::varchar(64);--> statement-breakpoint
ALTER TABLE "storage"."storage_object" ALTER COLUMN "acl" SET DATA TYPE varchar(16) USING "acl"::varchar(16);--> statement-breakpoint
CREATE INDEX "storage_folder_scope_path_idx" ON "storage"."storage_folder" ("scope","path");--> statement-breakpoint
CREATE INDEX "storage_object_scope_name_idx" ON "storage"."storage_object" ("scope","status","search_name");