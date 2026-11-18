import { type FastifyPluginAsync } from "fastify"
import { userHandler } from "./user-http.handler"

const router: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post<{ Body: { email: string; password: string } }>(
    "/auth/login",
    {
      schema: {
        body: {
          type: "object",
          required: ["email", "password"],
          additionalProperties: false,
          properties: {
            email: { type: "string", minLength: 1, maxLength: 320 },
            password: { type: "string", minLength: 1, maxLength: 200 },
          },
        },
      },
    },
    userHandler.logIn,
  )

  fastify.post("/auth/logout", userHandler.logOut)
}

export default router
