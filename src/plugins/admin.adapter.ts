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
  await fastify.register(fastifyStatic, { root: adminDirectory, serve: false })

  fastify.get("/admin/login", async (request, reply) => {
    if (await request.isAdmin()) return await reply.redirect("/admin/")
    return await reply.sendFile("login.html")
  })

  await fastify.register(async (pages) => {
    pages.addHook("onRequest", pages.authenticatePage)

    pages.get("/admin/", async (_request, reply) => await reply.sendFile("index.html"))
    pages.get("/admin/auth.js", async (_request, reply) => await reply.sendFile("auth.js"))
    pages.get(
      "/admin/ai-generate.js",
      async (_request, reply) => await reply.sendFile("ai-generate.js"),
    )
    pages.get(
      "/admin/product-options",
      async (_request, reply) => await reply.sendFile("product-options.html"),
    )
    pages.get(
      "/admin/site-settings",
      async (_request, reply) => await reply.sendFile("site-settings.html"),
    )
    pages.get("/admin/orders", async (_request, reply) => await reply.sendFile("orders.html"))
    pages.get<{ Params: { id: string } }>(
      "/admin/orders/:id",
      async (_request, reply) => await reply.sendFile("order.html"),
    )
    pages.get<{ Params: { id: string } }>(
      "/admin/products/:id",
      async (_request, reply) => await reply.sendFile("product.html"),
    )
  })

  await fastify.register(async (api) => {
    api.addHook("onRequest", api.authenticate)

    api.post("/admin/deploy", async (_request, reply) => {
      try {
        await vercelDeployAdapter.redeployFrontend()
        return await reply.code(202).send({ message: "Storefront deployment started" })
      } catch (error) {
        api.log.error(error, "Could not trigger the storefront deployment")
        return await reply.code(503).send({ message: "Could not start the storefront deployment" })
      }
    })

    api.post<{ Body: AiGenerateRequest }>(
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
          api.log.error(error, "Could not generate the AI text")
          return await reply.code(503).send({ message: "Could not generate the AI text" })
        }
      },
    )
  })
}

export default fp(adminAdapter, { name: "admin", dependencies: ["admin-auth"] })
