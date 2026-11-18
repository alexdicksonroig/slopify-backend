import { type FastifyPluginAsync } from "fastify"
import { siteSettingsHandler } from "./site-settings-http.handler"

const router: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get("/site-settings", siteSettingsHandler.get)
  fastify.get("/site-settings/languages", siteSettingsHandler.listLanguages)

  fastify.put<{ Body: { supportedLanguages: string[] } }>(
    "/site-settings",
    {
      onRequest: fastify.authenticate,
      schema: {
        body: {
          type: "object",
          required: ["supportedLanguages"],
          additionalProperties: false,
          properties: {
            supportedLanguages: {
              type: "array",
              items: { type: "string", pattern: "^[a-z]{2,3}-[A-Z]{2}$" },
            },
          },
        },
      },
    },
    siteSettingsHandler.update,
  )
}

export default router
