import cors from "@fastify/cors"
import fp from "fastify-plugin"

export default fp(
  async (fastify) => {
    await fastify.register(cors, {
      origin: [
        process.env.CORS_ORIGIN ?? "http://localhost:5173",
        "https://slopifyproject.com",
      ],
    })
  },
  { name: "cors" },
)
