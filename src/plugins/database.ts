import fp from "fastify-plugin"
import { initDrizzleDB, shutdownDrizzleDB, getDrizzleDB, type Database } from "@database"

export default fp(
  async (fastify) => {
    await initDrizzleDB()

    fastify.decorate("db", getDrizzleDB())
    fastify.addHook("onClose", async () => {
      await shutdownDrizzleDB()
    })
  },
  {
    name: "database",
  },
)

declare module "fastify" {
  interface FastifyInstance {
    db: Database
  }
}
