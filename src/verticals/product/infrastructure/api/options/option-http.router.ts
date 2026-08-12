import { type FastifyPluginAsync } from "fastify"
import { optionHandler } from "./option-http.handler"

const nonBlankString = {
  type: "string",
  minLength: 1,
  pattern: ".*\\S.*",
}

const optionIdParams = {
  type: "object",
  required: ["optionId"],
  additionalProperties: false,
  properties: { optionId: { type: "string", pattern: "^[1-9][0-9]*$" } },
}

const router: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get("/product-options", optionHandler.list)

  // TODO: Require admin authentication for all Product Option mutation routes.
  fastify.post<{
    Body: { possibleValues: string[]; label: string }
  }>(
    "/product-options",
    {
      schema: {
        body: {
          type: "object",
          required: ["possibleValues", "label"],
          additionalProperties: false,
          properties: {
            possibleValues: {
              type: "array",
              minItems: 1,
              uniqueItems: true,
              items: nonBlankString,
            },
            label: nonBlankString,
          },
        },
      },
    },
    optionHandler.create,
  )

  fastify.delete<{ Params: { optionId: string } }>(
    "/product-options/:optionId",
    { schema: { params: optionIdParams } },
    optionHandler.delete,
  )
}

export default router
