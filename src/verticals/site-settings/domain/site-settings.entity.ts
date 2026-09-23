export class SiteSettings {
  readonly supportedLanguages: { code: string; label: string }[]

  constructor(languages: { code: string; label: string; selected: boolean }[]) {
    this.supportedLanguages = languages
      .filter((language) => language.selected)
      .map(({ code, label }) => ({ code, label }))
  }
}
