-- dimah-s3 schema 2.2.0: `search_name` is the name folded for search, which the plugin writes with every
-- name it stores. Rows from 2.1.0 get the name lowercased, with whitespace collapsed and `%`, `_` and `\`
-- mapped to U+E000–U+E002 as the plugin maps them. Accents and look-alike letters stay as they are.
ALTER TABLE "storage"."storage_folder" ADD COLUMN "search_name" varchar(1024);--> statement-breakpoint
UPDATE "storage"."storage_folder" SET "search_name" = replace(replace(replace(lower(btrim(regexp_replace("name", '\s+', ' ', 'g'))), '%', chr(57344)), '_', chr(57345)), chr(92), chr(57346));--> statement-breakpoint
ALTER TABLE "storage"."storage_folder" ALTER COLUMN "search_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "storage"."storage_object" ADD COLUMN "search_name" varchar(1024);--> statement-breakpoint
UPDATE "storage"."storage_object" SET "search_name" = replace(replace(replace(lower(btrim(regexp_replace("filename", '\s+', ' ', 'g'))), '%', chr(57344)), '_', chr(57345)), chr(92), chr(57346));--> statement-breakpoint
ALTER TABLE "storage"."storage_object" ALTER COLUMN "search_name" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "private_dimah_s3_settings" ALTER COLUMN "value" SET DEFAULT '2.2.0';
