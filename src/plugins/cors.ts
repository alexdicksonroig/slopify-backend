import cors from "@fastify/cors"
import fp from "fastify-plugin"

export default fp(
  async (fastify) => {
    await fastify.register(cors, {
      origin: [
        "http://localhost:5173",
        "https://www.slopifyproject.com",
      ],
    })
  },
  { name: "cors" },
)
