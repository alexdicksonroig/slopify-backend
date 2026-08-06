import Fastify from "fastify"
import app, { options } from "./app"

const logLevel = process.env.LOG_LEVEL ?? "info"

const server = Fastify({
  ignoreTrailingSlash: true,
  logger:
    process.env.NODE_ENV === "production"
      ? { level: logLevel }
      : {
          level: logLevel,
          transport: {
            target: "pino-pretty",
            options: {
              colorize: true,
              translateTime: "SYS:standard",
              ignore: "pid,hostname",
              singleLine: true,
            },
          },
        },
})

await server.register(app, options)

const address = await server.listen({
  host: process.env.HOST ?? "127.0.0.1",
  port: Number(process.env.PORT ?? 3000),
})

server.log.info(`Swagger UI: ${address}/documentation`)
