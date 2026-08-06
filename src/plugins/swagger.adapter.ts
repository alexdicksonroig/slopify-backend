import swagger from "@fastify/swagger"
import swaggerUi from "@fastify/swagger-ui"
import { type FastifyPluginAsync } from "fastify"
import fp from "fastify-plugin"

const swaggerAdapter: FastifyPluginAsync = async (fastify): Promise<void> => {
  await fastify.register(swagger, {
    openapi: {
      info: {
        title: "Slopify API",
        description: "HTTP API documentation for Slopify.",
        version: "1.0.0",
      },
    },
  })

  await fastify.register(swaggerUi, {
    routePrefix: "/documentation",
  })
}

export default fp(swaggerAdapter, { name: "swagger" })
