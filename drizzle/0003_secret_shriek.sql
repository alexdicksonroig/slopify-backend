ALTER TABLE "product_variants" RENAME TO "variants";--> statement-breakpoint
ALTER TABLE "product_variant_selections" RENAME TO "variant_selections";--> statement-breakpoint
ALTER TABLE "variant_selections" RENAME COLUMN "product_variant_id" TO "variant_id";--> statement-breakpoint
ALTER INDEX "product_variant_selections_filter_idx" RENAME TO "variant_selections_filter_idx";--> statement-breakpoint
ALTER TABLE "variant_selections" RENAME CONSTRAINT "product_variant_selections_product_id_products_id_fk" TO "variant_selections_product_id_products_id_fk";--> statement-breakpoint
ALTER TABLE "variant_selections" RENAME CONSTRAINT "product_variant_selections_product_variant_id_product_variants_id_fk" TO "variant_selections_variant_id_variants_id_fk";--> statement-breakpoint
ALTER TABLE "variant_selections" RENAME CONSTRAINT "product_variant_selections_product_option_id_product_options_id_fk" TO "variant_selections_product_option_id_product_options_id_fk";--> statement-breakpoint
ALTER TABLE "variant_selections" RENAME CONSTRAINT "product_variant_selections_product_option_value_id_product_option_values_id_fk" TO "variant_selections_product_option_value_id_product_option_values_id_fk";--> statement-breakpoint
ALTER TABLE "variant_selections" RENAME CONSTRAINT "product_variant_selections_product_variant_id_product_option_id_pk" TO "variant_selections_variant_id_product_option_id_pk";--> statement-breakpoint
ALTER TABLE "variants" ADD COLUMN "thumbnail_reference" text;--> statement-breakpoint
UPDATE "variants"
SET "thumbnail_reference" = "products"."thumbnail_reference"
FROM "products"
WHERE "variants"."product_id" = "products"."id";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "thumbnail_reference";
