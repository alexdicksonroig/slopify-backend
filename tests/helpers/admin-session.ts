import Fastify from "fastify"
import adminAuth from "../../src/plugins/admin-auth.adapter"

process.env.JWT_SECRET ??= "test-secret"

const signer = Fastify()
await signer.register(adminAuth)
await signer.ready()

export const signSession = (payload: Record<string, unknown> = {}) =>
  signer.jwt.sign(payload, { sub: "1" })

export const adminCookie = `slopify_admin_session=${signSession()}`
export { adminAuth }
