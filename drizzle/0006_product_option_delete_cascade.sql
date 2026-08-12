ALTER TABLE "product_variant_selections" DROP CONSTRAINT "product_variant_selections_product_option_id_product_options_id_fk";
--> statement-breakpoint
ALTER TABLE "product_variant_selections" ADD CONSTRAINT "product_variant_selections_product_option_id_product_options_id_fk" FOREIGN KEY ("product_option_id") REFERENCES "public"."product_options"("id") ON DELETE cascade ON UPDATE no action;
