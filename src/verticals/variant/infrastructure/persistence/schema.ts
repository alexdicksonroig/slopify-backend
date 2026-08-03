import { pgTable, serial, text } from 'drizzle-orm/pg-core'

export const variants = pgTable('variants', {
  id: serial('id').primaryKey(),
  possibleOptions: text('possible_options').array().notNull(),
  label: text('label').notNull()
})
