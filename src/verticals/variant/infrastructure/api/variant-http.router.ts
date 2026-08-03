import { type FastifyPluginAsync } from 'fastify'
import { type CreateVariantBody } from './variant-http.dtos'
import { variantHandler } from './variant-http.handler'

const nonBlankString = {
  type: 'string',
  minLength: 1,
  pattern: '.*\\S.*'
}

const router: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.get('/variants', variantHandler.list)

  // TODO: Require admin authentication for all Variant mutation routes.
  fastify.post<{ Body: CreateVariantBody }>('/variants', {
    schema: {
      body: {
        type: 'object',
        required: ['possibleOptions', 'label'],
        additionalProperties: false,
        properties: {
          possibleOptions: {
            type: 'array',
            minItems: 1,
            uniqueItems: true,
            items: nonBlankString
          },
          label: nonBlankString
        }
      }
    }
  }, variantHandler.create)
}

export default router
