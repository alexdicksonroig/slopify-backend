import dotenv from "dotenv"
import { defineConfig } from "drizzle-kit"

dotenv.config({ path: ".env" })

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error("DATABASE_URL is required")

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/verticals/**/infrastructure/persistence/schema.ts",
  out: "./fixtures",
  dbCredentials: { url: databaseUrl },
  migrations: { table: "__drizzle_seed_migrations", schema: "public" },
})
