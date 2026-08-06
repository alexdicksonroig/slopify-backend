CREATE TABLE "product_options" (
	"id" serial PRIMARY KEY NOT NULL,
	"possible_values" text[] NOT NULL,
	"label" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"sku" text NOT NULL,
	CONSTRAINT "product_variants_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "product_variant_selections" (
	"product_variant_id" integer NOT NULL,
	"product_option_id" integer NOT NULL,
	"value" text NOT NULL,
	CONSTRAINT "product_variant_selections_product_variant_id_product_option_id_pk" PRIMARY KEY("product_variant_id","product_option_id")
);
--> statement-breakpoint
DROP TABLE "variants" CASCADE;--> statement-breakpoint
DROP TABLE "users" CASCADE;--> statement-breakpoint
ALTER TABLE "product_variant_selections" ADD CONSTRAINT "product_variant_selections_product_variant_id_product_variants_id_fk" FOREIGN KEY ("product_variant_id") REFERENCES "public"."product_variants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_variant_selections" ADD CONSTRAINT "product_variant_selections_product_option_id_product_options_id_fk" FOREIGN KEY ("product_option_id") REFERENCES "public"."product_options"("id") ON DELETE restrict ON UPDATE no action;