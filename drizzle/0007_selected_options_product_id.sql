ALTER TABLE "product_variant_selections" ADD COLUMN "product_id" integer;
--> statement-breakpoint
UPDATE "product_variant_selections"
SET "product_id" = "product_variants"."product_id"
FROM "product_variants"
WHERE "product_variant_selections"."product_variant_id" = "product_variants"."id";
--> statement-breakpoint
ALTER TABLE "product_variant_selections" ALTER COLUMN "product_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "product_variant_selections" ADD CONSTRAINT "product_variant_selections_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "product_variant_selections_filter_idx" ON "product_variant_selections" USING btree ("product_option_id", "product_option_value_id", "product_id");
