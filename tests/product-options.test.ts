import assert from "node:assert/strict"
import { test } from "node:test"
import Fastify from "fastify"
import optionRouter from "../src/verticals/product/infrastructure/api/options/option-http.router"
import { optionRepository } from "../src/verticals/product/infrastructure/persistence/options/option.repository"
import { ProductOption } from "../src/verticals/product/domain/options/product-option.entity"
import { parseVariantFilters } from "../src/verticals/product/infrastructure/variant-filter-query.adapter"

test("option creation requires a string ID and deletion uses that ID", async () => {
  const app = Fastify({ ajv: { customOptions: { coerceTypes: false } } })
  const originalCreate = optionRepository.create
  const originalDelete = optionRepository.delete
  optionRepository.create = async (input) => new ProductOption(12, input.optionId, [], input.label)
  optionRepository.delete = async (optionId) => {
    assert.equal(optionId, "frame-color")
    return true
  }
  try {
    await app.register(optionRouter)
    const payload = { label: { en: "Color" }, possibleValues: [{ en: "Red" }] }
    for (const optionId of [undefined, "", "   ", 12, "color1", "frame color", "frame_color"]) {
      const response = await app.inject({
        method: "POST",
        url: "/product-options",
        payload: { ...payload, optionId },
      })
      assert.equal(response.statusCode, 400)
    }
    const created = await app.inject({
      method: "POST",
      url: "/product-options",
      payload: { ...payload, optionId: "frame-color" },
    })
    assert.equal(created.statusCode, 201)
    assert.equal(created.json().id, 12)
    assert.equal(created.json().optionId, "frame-color")
    const deleted = await app.inject({
      method: "DELETE",
      url: "/product-options/frame-color",
    })
    assert.equal(deleted.statusCode, 204)
  } finally {
    optionRepository.create = originalCreate
    optionRepository.delete = originalDelete
    await app.close()
  }
})

test("variant filtering and selection routes preserve string option IDs", async () => {
  process.env.R2_ENDPOINT = "https://example.invalid"
  process.env.R2_BUCKET = "test"
  process.env.R2_PUBLIC_BASE_URL = "https://example.invalid"
  process.env.R2_ACCESS_KEY_ID = "test"
  process.env.R2_SECRET_ACCESS_KEY = "test"
  const { default: variantRouter } =
    await import("../src/verticals/product/infrastructure/api/variants/variant-http.router")
  const { variantRepository } =
    await import("../src/verticals/product/infrastructure/persistence/variants/variant.repository")
  const app = Fastify()
  const originalFindAll = variantRepository.findAll
  const originalAdd = variantRepository.addSelection
  const originalDelete = variantRepository.deleteSelection
  const calls: unknown[] = []
  variantRepository.findAll = async (filters) => {
    calls.push(filters)
    return []
  }
  variantRepository.addSelection = async (...args) => {
    calls.push(args)
  }
  variantRepository.deleteSelection = async (...args) => {
    calls.push(args)
  }
  try {
    await app.register(variantRouter)
    assert.deepEqual(parseVariantFilters({ "001": "2", color: "3" }), [
      { optionId: "001", valueId: 2 },
      { optionId: "color", valueId: 3 },
    ])
    assert.equal((await app.inject("/variants?color=3&size=4")).statusCode, 200)
    assert.deepEqual(calls.shift(), [
      { optionId: "color", valueId: 3 },
      { optionId: "size", valueId: 4 },
    ])
    assert.equal((await app.inject("/variants?color=red")).statusCode, 400)
    for (const optionId of ["color1", "frame_color", "frame color"]) {
      assert.equal(
        (await app.inject("/variants?" + encodeURIComponent(optionId) + "=3")).statusCode,
        400,
      )
    }
    const added = await app.inject({
      method: "POST",
      url: "/variants/7/selections",
      payload: { optionId: "frame-color", valueId: 3 },
    })
    assert.equal(added.statusCode, 204)
    assert.deepEqual(calls.shift(), [7, "frame-color", 3])
    const deleted = await app.inject({
      method: "DELETE",
      url: "/variants/7/selections/frame-color",
    })
    assert.equal(deleted.statusCode, 204)
    assert.deepEqual(calls.shift(), [7, "frame-color"])
  } finally {
    variantRepository.findAll = originalFindAll
    variantRepository.addSelection = originalAdd
    variantRepository.deleteSelection = originalDelete
    await app.close()
  }
})
