import { boolean, pgTable, text } from "drizzle-orm/pg-core"

export const languages = pgTable("site_languages", {
  code: text("code").primaryKey(),
  label: text("label").notNull(),
  selected: boolean("selected").notNull().default(false),
})
