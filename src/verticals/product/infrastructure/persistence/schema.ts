import { index, integer, pgTable, primaryKey, serial, text, timestamp } from "drizzle-orm/pg-core"

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  thumbnailReference: text("thumbnail_reference"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
})

export const productOptions = pgTable("product_options", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
})

export const productOptionValues = pgTable("product_option_values", {
  id: serial("id").primaryKey(),
  productOptionId: integer("product_option_id")
    .notNull()
    .references(() => productOptions.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
})

export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  sku: text("sku").notNull().unique(),
  unitAmount: integer("unit_amount").notNull(),
  currency: text("currency").notNull(),
})

export const selectedOptions = pgTable(
  "product_variant_selections",
  {
    productId: integer("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    productVariantId: integer("product_variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    productOptionId: integer("product_option_id")
      .notNull()
      .references(() => productOptions.id, { onDelete: "cascade" }),
    productOptionValueId: integer("product_option_value_id")
      .notNull()
      .references(() => productOptionValues.id, { onDelete: "restrict" }),
  },
  (table) => [
    primaryKey({ columns: [table.productVariantId, table.productOptionId] }),
    index("product_variant_selections_filter_idx").on(
      table.productOptionId,
      table.productOptionValueId,
      table.productId,
    ),
  ],
)
