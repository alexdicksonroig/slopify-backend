import fastifyStatic from "@fastify/static"
import { type FastifyPluginAsync } from "fastify"
import fp from "fastify-plugin"
import { fileURLToPath } from "node:url"
import { vercelDeployAdapter } from "../infrastructure/vercel-deploy.adapter"

const adminDirectory = fileURLToPath(new URL("../../admin", import.meta.url))

const adminAdapter: FastifyPluginAsync = async (fastify): Promise<void> => {
  await fastify.register(fastifyStatic, {
    root: adminDirectory,
    prefix: "/admin/",
    index: "index.html",
    wildcard: false,
  })

  fastify.get("/admin/product-options", async (_request, reply) => {
    return await reply.sendFile("product-options.html")
  })

  fastify.post("/admin/deploy", async (_request, reply) => {
    try {
      await vercelDeployAdapter.redeployFrontend()
      return await reply.code(202).send({ message: "Storefront deployment started" })
    } catch (error) {
      fastify.log.error(error, "Could not trigger the storefront deployment")
      return await reply.code(503).send({ message: "Could not start the storefront deployment" })
    }
  })

  fastify.get("/admin/orders", async (_request, reply) => {
    return await reply.sendFile("orders.html")
  })

  fastify.get<{ Params: { id: string } }>("/admin/orders/:id", async (_request, reply) => {
    return await reply.sendFile("order.html")
  })

  fastify.get<{ Params: { id: string } }>("/admin/products/:id", async (_request, reply) => {
    return await reply.sendFile("product.html")
  })
}

export default fp(adminAdapter, { name: "admin" })
