ALTER TABLE "product_option_values"
ALTER COLUMN "label" SET DATA TYPE jsonb
USING jsonb_build_object('en', "label");--> statement-breakpoint
ALTER TABLE "product_options"
ALTER COLUMN "label" SET DATA TYPE jsonb
USING jsonb_build_object('en', "label");--> statement-breakpoint
ALTER TABLE "products"
ALTER COLUMN "description" SET DATA TYPE jsonb
USING CASE
  WHEN "description" IS NULL THEN NULL
  ELSE jsonb_build_object('en', "description")
END;
