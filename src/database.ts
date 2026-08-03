import { drizzle } from 'drizzle-orm/postgres-js'
import postgres, { type Sql } from 'postgres'

export type Database = ReturnType<typeof drizzle>

let client: Sql | null = null
let db: Database | null = null

export const initDrizzleDB = async (): Promise<void> => {
  if (db) return

  const databaseUrl = process.env.DATABASE_URL
  if (!databaseUrl) throw new Error('DATABASE_URL is required')

  client = postgres(databaseUrl)
  db = drizzle(client)

  try {
    await client`select 1`
  } catch (error) {
    await shutdownDrizzleDB()
    throw error
  }
}

export const getDrizzleDB = (): Database => {
  if (!db) throw new Error('Database has not been initialized')
  return db
}

export const shutdownDrizzleDB = async (): Promise<void> => {
  if (!client) return

  await client.end({ timeout: 0 })
  client = null
  db = null
}
