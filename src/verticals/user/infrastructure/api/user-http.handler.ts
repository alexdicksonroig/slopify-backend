import { type FastifyReply, type FastifyRequest } from "fastify"
import { adminSessionAdapter } from "../../../../infrastructure/admin-session.adapter"
import { logInUseCase } from "../../application/log-in.use-case"

class UserHandler {
  logIn = async (
    request: FastifyRequest<{ Body: { email: string; password: string } }>,
    reply: FastifyReply,
  ) => {
    const user = await logInUseCase.execute(request.body.email, request.body.password)
    if (!user) return await reply.code(401).send({ message: "Invalid email or password" })
    const token = await reply.jwtSign({}, { sub: String(user.id) })
    return await reply
      .header("set-cookie", adminSessionAdapter.createCookie(token))
      .code(204)
      .send()
  }

  logOut = async (_request: FastifyRequest, reply: FastifyReply) =>
    await reply.header("set-cookie", adminSessionAdapter.clearCookie()).code(204).send()
}

export const userHandler = new UserHandler()
