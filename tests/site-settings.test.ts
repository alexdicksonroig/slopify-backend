import assert from "node:assert/strict"
import { test } from "node:test"
import Fastify from "fastify"
import router from "../src/verticals/site-settings/infrastructure/api/site-settings-http.router"
import { siteSettingsRepository } from "../src/verticals/site-settings/infrastructure/persistence/site-settings.repository"
import { SiteSettings } from "../src/verticals/site-settings/domain/site-settings.entity"

test("HTTP settings list rows, save selections, clear them, and reject invalid input", async () => {
  const app = Fastify()
  const rows = [
    { code: "ca-ES", label: "Català", selected: false },
    { code: "es-ES", label: "Español", selected: false },
  ]
  const originalGet = siteSettingsRepository.get
  const originalGetLanguages = siteSettingsRepository.getLanguages
  const originalSave = siteSettingsRepository.save
  siteSettingsRepository.getLanguages = async () => rows
  siteSettingsRepository.get = async () => new SiteSettings(rows)
  siteSettingsRepository.save = async (codes) => {
    for (const row of rows) row.selected = codes.includes(row.code)
    return await siteSettingsRepository.get()
  }
  try {
    await app.register(router)
    assert.deepEqual((await app.inject("/site-settings")).json(), { supportedLanguages: [] })
    assert.deepEqual((await app.inject("/site-settings/languages")).json(), rows)
    const saved = await app.inject({
      method: "PUT",
      url: "/site-settings",
      payload: { supportedLanguages: ["es-ES", "ca-ES"] },
    })
    assert.equal(saved.statusCode, 200)
    assert.deepEqual(saved.json().supportedLanguages, [
      { code: "ca-ES", label: "Català" },
      { code: "es-ES", label: "Español" },
    ])
    assert.ok(rows.every((row) => row.selected))
    const changed = await app.inject({
      method: "PUT",
      url: "/site-settings",
      payload: { supportedLanguages: ["ca-ES"] },
    })
    assert.deepEqual(changed.json(), {
      supportedLanguages: [{ code: "ca-ES", label: "Català" }],
    })
    assert.equal(rows[1].selected, false)
    for (const payload of [
      {},
      { supportedLanguages: [{ code: "es-ES", label: "Other" }] },
      { supportedLanguages: null },
    ]) {
      const response = await app.inject({ method: "PUT", url: "/site-settings", payload })
      assert.equal(response.statusCode, 400)
    }
    const cleared = await app.inject({
      method: "PUT",
      url: "/site-settings",
      payload: { supportedLanguages: [] },
    })
    assert.equal(cleared.statusCode, 200)
    assert.deepEqual(cleared.json(), { supportedLanguages: [] })
    assert.ok(rows.every((row) => !row.selected))
  } finally {
    siteSettingsRepository.get = originalGet
    siteSettingsRepository.getLanguages = originalGetLanguages
    siteSettingsRepository.save = originalSave
    await app.close()
  }
})
