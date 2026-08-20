ALTER TABLE "order_items" ADD COLUMN "product_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "unit_amount" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "order_items" ADD COLUMN "currency" text NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "checkout_session_id" text;--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "status" text NOT NULL;--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "unit_amount" integer;--> statement-breakpoint
ALTER TABLE "product_variants" ADD COLUMN "currency" text;--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "coupon_code";--> statement-breakpoint
ALTER TABLE "orders" DROP COLUMN "address";--> statement-breakpoint
ALTER TABLE "products" DROP COLUMN "price_in_cents";--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_checkout_session_id_unique" UNIQUE("checkout_session_id");