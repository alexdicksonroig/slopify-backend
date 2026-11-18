import cors from "@fastify/cors"
import fp from "fastify-plugin"

export default fp(
  async (fastify) => {
    const origins = (process.env.CORS_ORIGIN ?? "")
      .split(",")
      .map((origin) => origin.trim())
      .filter((origin) => origin.length > 0)
    if (origins.length === 0) return

    await fastify.register(cors, { origin: origins })
  },
  { name: "cors" },
)
