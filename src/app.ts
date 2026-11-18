import * as path from "node:path"
import AutoLoad, { type AutoloadPluginOptions } from "@fastify/autoload"
import { type FastifyPluginAsync } from "fastify"
import { fileURLToPath } from "node:url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export type AppOptions = {} & Partial<AutoloadPluginOptions>

const options: AppOptions = {}

const app: FastifyPluginAsync<AppOptions> = async (fastify, opts): Promise<void> => {
  void fastify.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
    options: opts,
    forceESM: true,
  })

  void fastify.register(AutoLoad, {
    dir: path.join(__dirname, "verticals"),
    matchFilter: /\.router\.(?:js|ts)$/,
    dirNameRoutePrefix: false,
    options: opts,
    forceESM: true,
  })
}

export default app
export { app, options }
