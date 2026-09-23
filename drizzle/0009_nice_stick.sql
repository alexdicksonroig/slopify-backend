ALTER TABLE "product_options" ADD COLUMN "option_id" text;
--> statement-breakpoint
UPDATE "product_options" SET "option_id" = 'option-' || translate("id"::text, '0123456789', 'abcdefghij');
--> statement-breakpoint
ALTER TABLE "product_options" ALTER COLUMN "option_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "product_options" ADD CONSTRAINT "product_options_option_id_unique" UNIQUE("option_id");