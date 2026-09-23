import { type FastifyRequest } from "fastify"
import { updateSiteSettingsUseCase } from "../../application/update-site-settings.use-case"
import { siteSettingsRepository } from "../persistence/site-settings.repository"

class SiteSettingsHandler {
  get = async () => await siteSettingsRepository.get()

  listLanguages = async () => await siteSettingsRepository.getLanguages()

  update = async (request: FastifyRequest<{ Body: { supportedLanguages: string[] } }>) =>
    await updateSiteSettingsUseCase.execute(request.body.supportedLanguages)
}

export const siteSettingsHandler = new SiteSettingsHandler()
