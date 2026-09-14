DROP INDEX "auth"."account_issuer_accountId_uidx";--> statement-breakpoint
ALTER TABLE "auth"."account" DROP COLUMN "issuer";