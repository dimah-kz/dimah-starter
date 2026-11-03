CREATE TABLE "storage"."storage_folder" (
	"id" varchar(255) PRIMARY KEY,
	"scope" text NOT NULL,
	"parent_id" text DEFAULT '' NOT NULL,
	"name" text NOT NULL,
	"path" text NOT NULL,
	"created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL,
	CONSTRAINT "storage_folder_scope_path_uk" UNIQUE("scope","path"),
	CONSTRAINT "storage_folder_scope_parent_name_uk" UNIQUE("scope","parent_id","name")
);
--> statement-breakpoint
DROP INDEX "storage"."storage_object_bucket_key_uk";--> statement-breakpoint
DROP INDEX "storage"."storage_object_scope_status_created_idx";--> statement-breakpoint
DROP INDEX "storage"."storage_object_status_created_idx";--> statement-breakpoint
ALTER TABLE "storage"."private_dimah_s3_settings" ADD COLUMN "key" varchar(255);--> statement-breakpoint
ALTER TABLE "storage"."private_dimah_s3_settings" ADD COLUMN "value" text DEFAULT '2.1.0' NOT NULL;--> statement-breakpoint
ALTER TABLE "storage"."storage_object" ADD COLUMN "folder_id" text;--> statement-breakpoint
ALTER TABLE "storage"."storage_object" ADD COLUMN "s3_metadata" json;--> statement-breakpoint
ALTER TABLE "storage"."storage_object" ADD COLUMN "attributes" json;--> statement-breakpoint
ALTER TABLE "storage"."storage_object" ADD COLUMN "upload_token" text;--> statement-breakpoint
ALTER TABLE "storage"."private_dimah_s3_settings" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "storage"."private_dimah_s3_settings" DROP COLUMN "version";--> statement-breakpoint
ALTER TABLE "storage"."storage_object" DROP COLUMN "metadata";--> statement-breakpoint
ALTER TABLE "storage"."private_dimah_s3_settings" ADD PRIMARY KEY ("key");--> statement-breakpoint
ALTER TABLE "storage"."storage_object" ALTER COLUMN "route" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "storage"."storage_object" ALTER COLUMN "filename" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "storage"."storage_object" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "storage"."storage_object" ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "storage"."storage_object" ADD CONSTRAINT "storage_object_bucket_key_uk" UNIQUE("bucket","key");--> statement-breakpoint
CREATE INDEX "storage_object_scope_folder_idx" ON "storage"."storage_object" ("scope","status","folder_id","created_at");--> statement-breakpoint
CREATE INDEX "storage_object_scope_updated_idx" ON "storage"."storage_object" ("scope","status","updated_at");--> statement-breakpoint
CREATE INDEX "storage_object_scope_filename_idx" ON "storage"."storage_object" ("scope","status","filename");--> statement-breakpoint
CREATE INDEX "storage_object_scope_size_idx" ON "storage"."storage_object" ("scope","status","size");