import { getDrizzleDB } from "@database"
import { inArray } from "drizzle-orm"
import { SiteSettings } from "../../domain/site-settings.entity"
import { languages } from "./schema"

class SiteSettingsRepository {
  async getLanguages(): Promise<(typeof languages.$inferSelect)[]> {
    return await getDrizzleDB().select().from(languages).orderBy(languages.code)
  }

  async get(): Promise<SiteSettings> {
    const records = await this.getLanguages()
    return new SiteSettings(records)
  }

  async save(codes: string[]): Promise<SiteSettings> {
    const records = await getDrizzleDB()
      .update(languages)
      .set({ selected: inArray(languages.code, codes) })
      .returning()
    return new SiteSettings(records)
  }
}

export const siteSettingsRepository = new SiteSettingsRepository()
