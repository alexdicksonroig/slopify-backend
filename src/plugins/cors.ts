import cors from "@fastify/cors"
import fp from "fastify-plugin"

export default fp(
  async (fastify) => {
    const origin = ["http://localhost:5173"]
    if (process.env.FRONTEND_ORIGIN) origin.push(process.env.FRONTEND_ORIGIN)

    await fastify.register(cors, { origin })
  },
  { name: "cors" },
)
