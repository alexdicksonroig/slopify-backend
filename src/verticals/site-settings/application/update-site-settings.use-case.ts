import { SiteSettings } from "../domain/site-settings.entity"
import { siteSettingsRepository } from "../infrastructure/persistence/site-settings.repository"

class UpdateSiteSettingsUseCase {
  async execute(codes: string[]): Promise<SiteSettings> {
    return await siteSettingsRepository.save(codes)
  }
}

export const updateSiteSettingsUseCase = new UpdateSiteSettingsUseCase()
