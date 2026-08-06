import { integer, pgTable, primaryKey, serial, text, timestamp } from "drizzle-orm/pg-core"

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  priceInCents: integer("price_in_cents").notNull(),
  thumbnailReference: text("thumbnail_reference"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

export const productOptions = pgTable("product_options", {
  id: serial("id").primaryKey(),
  possibleValues: text("possible_values").array().notNull(),
  label: text("label").notNull(),
})

export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  sku: text("sku").notNull().unique(),
})

export const selectedOptions = pgTable(
  "product_variant_selections",
  {
    productVariantId: integer("product_variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    productOptionId: integer("product_option_id")
      .notNull()
      .references(() => productOptions.id, { onDelete: "restrict" }),
    value: text("value").notNull(),
  },
  (table) => [primaryKey({ columns: [table.productVariantId, table.productOptionId] })],
)
