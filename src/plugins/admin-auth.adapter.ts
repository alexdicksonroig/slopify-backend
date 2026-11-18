import fastifyJwt from "@fastify/jwt"
import { type FastifyPluginAsync, type FastifyReply, type FastifyRequest } from "fastify"
import fp from "fastify-plugin"
import { adminSessionAdapter } from "../infrastructure/admin-session.adapter"

type AuthHook = (request: FastifyRequest, reply: FastifyReply) => Promise<void>

const adminAuthAdapter: FastifyPluginAsync = async (fastify): Promise<void> => {
  const secret = process.env.JWT_SECRET?.trim()
  if (!secret) throw new Error("JWT_SECRET is required")

  await fastify.register(fastifyJwt, {
    secret,
    sign: { algorithm: "HS256", expiresIn: adminSessionAdapter.maxAgeSeconds * 1000 },
    verify: {
      algorithms: ["HS256"],
      extractToken: (request) => adminSessionAdapter.readToken(request.headers.cookie),
    },
  })

  fastify.decorateRequest("isAdmin", async function (this: FastifyRequest): Promise<boolean> {
    try {
      await this.jwtVerify()
      return true
    } catch {
      return false
    }
  })

  fastify.decorate<AuthHook>("authenticate", async (request, reply) => {
    if (await request.isAdmin()) return
    await reply.code(401).send({ message: "Authentication required" })
  })

  fastify.decorate<AuthHook>("authenticatePage", async (request, reply) => {
    if (await request.isAdmin()) return
    await reply.redirect(`/admin/login?next=${encodeURIComponent(request.url)}`)
  })
}

export default fp(adminAuthAdapter, { name: "admin-auth" })

declare module "fastify" {
  interface FastifyInstance {
    authenticate: AuthHook
    authenticatePage: AuthHook
  }
  interface FastifyRequest {
    isAdmin(): Promise<boolean>
  }
}
