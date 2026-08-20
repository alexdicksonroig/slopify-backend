ALTER TABLE "product_variants" DROP CONSTRAINT "product_variants_sku_unique";--> statement-breakpoint
ALTER TABLE "product_variants" ALTER COLUMN "unit_amount" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variants" ALTER COLUMN "currency" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variants" DROP COLUMN "sku";