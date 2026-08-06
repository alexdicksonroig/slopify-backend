import fastifyStatic from '@fastify/static'
import { type FastifyPluginAsync } from 'fastify'
import fp from 'fastify-plugin'
import { fileURLToPath } from 'node:url'

const adminDirectory = fileURLToPath(new URL('../../admin', import.meta.url))

const adminAdapter: FastifyPluginAsync = async (fastify): Promise<void> => {
  await fastify.register(fastifyStatic, {
    root: adminDirectory,
    prefix: '/admin/',
    index: 'index.html',
    wildcard: false
  })

  fastify.get('/admin/product-options', async (_request, reply) => {
    return await reply.sendFile('product-options.html')
  })
}

export default fp(adminAdapter, { name: 'admin' })
