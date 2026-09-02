DELETE FROM "variants"
WHERE NOT EXISTS (
  SELECT 1 FROM "products" WHERE "products"."id" = "variants"."product_id"
);--> statement-breakpoint
ALTER TABLE "variants" ADD CONSTRAINT "variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;