import { integer, pgTable, primaryKey, serial, timestamp } from "drizzle-orm/pg-core"

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  invoicePriceInCents: integer("invoice_price_in_cents").notNull(),
  shippingPriceInCents: integer("shipping_price_in_cents").notNull(),
  totalPriceInCents: integer("total_price_in_cents").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
})

export const orderItems = pgTable(
  "order_items",
  {
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: integer("product_id").notNull(),
    quantity: integer("quantity").notNull(),
    unitPriceInCents: integer("unit_price_in_cents").notNull(),
  },
  (table) => [primaryKey({ columns: [table.orderId, table.productId] })],
)
