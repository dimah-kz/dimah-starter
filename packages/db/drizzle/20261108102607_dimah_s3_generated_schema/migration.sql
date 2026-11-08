ALTER TABLE "storage"."storage_object" ALTER COLUMN "scope" SET DATA TYPE varchar(255) USING "scope"::varchar(255);--> statement-breakpoint
ALTER TABLE "storage"."storage_object" ALTER COLUMN "bucket" SET DATA TYPE varchar(255) USING "bucket"::varchar(255);--> statement-breakpoint
ALTER TABLE "storage"."storage_object" ALTER COLUMN "key" SET DATA TYPE varchar(1024) USING "key"::varchar(1024);--> statement-breakpoint
ALTER TABLE "storage"."storage_object" ALTER COLUMN "route" SET DATA TYPE varchar(255) USING "route"::varchar(255);--> statement-breakpoint
ALTER TABLE "storage"."storage_object" ALTER COLUMN "content_type" SET DATA TYPE varchar(255) USING "content_type"::varchar(255);--> statement-breakpoint
ALTER TABLE "storage"."storage_object" ALTER COLUMN "e_tag" SET DATA TYPE varchar(255) USING "e_tag"::varchar(255);--> statement-breakpoint
ALTER TABLE "storage"."storage_object" ALTER COLUMN "filename" SET DATA TYPE varchar(255) USING "filename"::varchar(255);--> statement-breakpoint
ALTER TABLE "storage"."storage_object" ALTER COLUMN "status" SET DATA TYPE varchar(16) USING "status"::varchar(16);--> statement-breakpoint
ALTER TABLE "storage"."storage_object" ALTER COLUMN "acl" SET DATA TYPE varchar(255) USING "acl"::varchar(255);--> statement-breakpoint
ALTER TABLE "storage"."storage_object" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "storage"."storage_object" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "storage"."storage_folder" ALTER COLUMN "scope" SET DATA TYPE varchar(255) USING "scope"::varchar(255);--> statement-breakpoint
ALTER TABLE "storage"."storage_folder" ALTER COLUMN "parent_id" SET DATA TYPE varchar(255) USING "parent_id"::varchar(255);--> statement-breakpoint
ALTER TABLE "storage"."storage_folder" ALTER COLUMN "name" SET DATA TYPE varchar(255) USING "name"::varchar(255);--> statement-breakpoint
ALTER TABLE "storage"."storage_folder" ALTER COLUMN "path" SET DATA TYPE varchar(1024) USING "path"::varchar(1024);--> statement-breakpoint
ALTER TABLE "storage"."storage_folder" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "storage"."storage_folder" ALTER COLUMN "updated_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "storage"."storage_object" ALTER COLUMN "folder_id" SET DATA TYPE varchar(255) USING "folder_id"::varchar(255);--> statement-breakpoint
ALTER TABLE "storage"."storage_object" ALTER COLUMN "upload_token" SET DATA TYPE varchar(64) USING "upload_token"::varchar(64);