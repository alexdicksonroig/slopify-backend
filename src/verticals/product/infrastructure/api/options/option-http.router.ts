import { type FastifyPluginAsync } from "fastify"
import { type LocalizedText } from "../../../domain/localized-text"
import { optionHandler } from "./option-http.handler"

const localizedText = {
  type: "object",
  minProperties: 1,
  additionalProperties: {
    type: "string",
    minLength: 1,
    pattern: ".*\\S.*",
  },
}

const optionIdParams = {
  type: "object",
  required: ["optionId"],
  additionalProperties: false,
  properties: { optionId: { type: "string", minLength: 1, pattern: "^[A-Za-z-]+$" } },
}

const router: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get("/product-options", optionHandler.list)

  fastify.post<{
    Body: { optionId: string; possibleValues: LocalizedText[]; label: LocalizedText }
  }>(
    "/product-options",
    {
      onRequest: fastify.authenticate,
      schema: {
        body: {
          type: "object",
          required: ["optionId", "possibleValues", "label"],
          additionalProperties: false,
          properties: {
            possibleValues: {
              type: "array",
              minItems: 1,
              uniqueItems: true,
              items: localizedText,
            },
            label: localizedText,
            optionId: { type: "string", minLength: 1, pattern: "^[A-Za-z-]+$" },
          },
        },
      },
    },
    optionHandler.create,
  )

  fastify.delete<{ Params: { optionId: string } }>(
    "/product-options/:optionId",
    { onRequest: fastify.authenticate, schema: { params: optionIdParams } },
    optionHandler.delete,
  )
}

export default router
