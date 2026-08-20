import { integer, pgTable, primaryKey, serial, text, timestamp } from "drizzle-orm/pg-core"

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  checkoutSessionId: text("checkout_session_id").unique(),
  status: text("status").notNull(),
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
    productName: text("product_name").notNull(),
    unitAmount: integer("unit_amount").notNull(),
    currency: text("currency").notNull(),
  },
  (table) => [primaryKey({ columns: [table.orderId, table.variantId] })],
)
