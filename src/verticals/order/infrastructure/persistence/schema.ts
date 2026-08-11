import { integer, pgTable, primaryKey, serial, text, timestamp } from "drizzle-orm/pg-core"

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  couponCode: text("coupon_code"),
  address: text("address").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export const orderItems = pgTable(
  "order_items",
  {
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    variantId: integer("variant_id").notNull(),
    quantity: integer("quantity").notNull(),
  },
  (table) => [primaryKey({ columns: [table.orderId, table.variantId] })],
)
