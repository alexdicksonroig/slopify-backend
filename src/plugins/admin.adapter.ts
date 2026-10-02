import fastifyStatic from "@fastify/static"
import { type FastifyPluginAsync } from "fastify"
import fp from "fastify-plugin"
import { fileURLToPath } from "node:url"
import {
  aiGenerateAdapter,
  AiGenerateBusyError,
  type AiGenerateRequest,
} from "../infrastructure/ai-generate.adapter"
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

  fastify.post<{ Body: AiGenerateRequest }>(
    "/admin/ai-generate",
    {
      schema: {
        body: {
          type: "object",
          required: ["prompt", "label", "shape", "languages"],
          additionalProperties: false,
          properties: {
            prompt: { type: "string", minLength: 1, maxLength: 5000 },
            label: { type: "string", minLength: 1, maxLength: 200 },
            context: { type: "string", maxLength: 2000 },
            shape: { type: "string", enum: ["text", "list"] },
            languages: {
              type: "array",
              minItems: 1,
              maxItems: 50,
              uniqueItems: true,
              items: { type: "string", pattern: "^[A-Za-z]{2,8}(-[A-Za-z0-9]{1,8})*$" },
            },
          },
        },
      },
    },
    async (request, reply) => {
      try {
        const value = await aiGenerateAdapter.generateLocalizedText(request.body)
        return await reply.send({ value })
      } catch (error) {
        if (error instanceof AiGenerateBusyError)
          return await reply.code(409).send({ message: "Another AI generation is running" })
        fastify.log.error(error, "Could not generate the AI text")
        return await reply.code(503).send({ message: "Could not generate the AI text" })
      }
    },
  )

  fastify.get("/admin/site-settings", async (_request, reply) => {
    return await reply.sendFile("site-settings.html")
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
