CREATE TABLE "auth"."passkey" (
	"id" text PRIMARY KEY,
	"name" text,
	"public_key" text NOT NULL,
	"user_id" text NOT NULL,
	"credential_id" text NOT NULL,
	"counter" integer NOT NULL,
	"device_type" text NOT NULL,
	"backed_up" boolean NOT NULL,
	"transports" text,
	"created_at" timestamp,
	"aaguid" text
);
--> statement-breakpoint
CREATE INDEX "passkey_userId_idx" ON "auth"."passkey" ("user_id");--> statement-breakpoint
CREATE INDEX "passkey_credentialID_idx" ON "auth"."passkey" ("credential_id");--> statement-breakpoint
ALTER TABLE "auth"."passkey" ADD CONSTRAINT "passkey_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."user"("id") ON DELETE CASCADE;