import { getDrizzleDB } from "@database"
import { and, countDistinct, eq, inArray, or } from "drizzle-orm"
import { ProductOption } from "../../../domain/options/product-option.entity"
import { ProductOptionValue } from "../../../domain/options/product-option-value.entity"
import { Product } from "../../../domain/product.entity"
import {
  Variant,
  VariantWithProduct,
  type ProductOptionSelection,
  type VariantInList,
} from "../../../domain/variants/variant.entity"
import { productOptionValues, productOptions, products, variants, selectedOptions } from "../schema"

class VariantRepository {
  async findAll(filters: { optionId: number; valueId: number }[]): Promise<VariantInList[]> {
    const database = getDrizzleDB()
    const filterConditions = filters.map((filter) =>
      and(
        eq(selectedOptions.productOptionId, filter.optionId),
        eq(selectedOptions.productOptionValueId, filter.valueId),
      ),
    )
    const variantIds = filterConditions.length
      ? database
          .select({ variantId: selectedOptions.variantId })
          .from(selectedOptions)
          .where(or(...filterConditions))
          .groupBy(selectedOptions.variantId)
          .having(eq(countDistinct(selectedOptions.productOptionId), filters.length))
      : undefined

    const variantRecords = await database
      .select({
        id: variants.id,
        productId: products.id,
        unitAmount: variants.unitAmount,
        currency: variants.currency,
        productName: products.name,
        productDescription: products.description,
        thumbnailReference: variants.thumbnailReference,
      })
      .from(variants)
      .innerJoin(products, eq(products.id, variants.productId))
      .where(variantIds ? inArray(variants.id, variantIds) : undefined)
      .orderBy(variants.id)

    const variantsInList = variantRecords.map((variant) => ({
      id: variant.id,
      unitAmount: variant.unitAmount,
      currency: variant.currency,
      thumbnail: variant.thumbnailReference,
      product: new Product(variant.productId, variant.productName, variant.productDescription),
    }))

    return variantsInList
  }

  // TODO: Refactor/cleanup
  async findById(id: number): Promise<VariantWithProduct | null> {
    const database = getDrizzleDB()
    const [variant] = await database
      .select({
        id: variants.id,
        productId: products.id,
        unitAmount: variants.unitAmount,
        currency: variants.currency,
        productName: products.name,
        productDescription: products.description,
        thumbnailReference: variants.thumbnailReference,
      })
      .from(variants)
      .innerJoin(products, eq(products.id, variants.productId))
      .where(eq(variants.id, id))
      .limit(1)

    if (!variant) return null

    const records = await database
      .select({
        optionId: productOptions.id,
        optionLabel: productOptions.label,
        valueId: productOptionValues.id,
        valueLabel: productOptionValues.label,
      })
      .from(selectedOptions)
      .innerJoin(productOptions, eq(productOptions.id, selectedOptions.productOptionId))
      .innerJoin(
        productOptionValues,
        eq(productOptionValues.id, selectedOptions.productOptionValueId),
      )
      .where(eq(selectedOptions.variantId, id))
      .orderBy(productOptions.id)

    return new VariantWithProduct(
      variant.id,
      variant.productId,
      variant.unitAmount,
      variant.currency,
      records.map((record) => ({
        option: new ProductOption(record.optionId, [], record.optionLabel),
        value: new ProductOptionValue(record.valueId, record.valueLabel),
      })),
      variant.thumbnailReference,
      new Product(variant.productId, variant.productName, variant.productDescription),
    )
  }

  async findForProduct(productId: number): Promise<Variant[]> {
    const database = getDrizzleDB()
    const variantRecords = await database
      .select()
      .from(variants)
      .where(eq(variants.productId, productId))
      .orderBy(variants.id)

    if (variantRecords.length === 0) return []

    const records = await database
      .select({
        variantId: selectedOptions.variantId,
        optionId: productOptions.id,
        optionLabel: productOptions.label,
        valueId: productOptionValues.id,
        valueLabel: productOptionValues.label,
      })
      .from(selectedOptions)
      .innerJoin(productOptions, eq(productOptions.id, selectedOptions.productOptionId))
      .innerJoin(
        productOptionValues,
        eq(productOptionValues.id, selectedOptions.productOptionValueId),
      )
      .where(
        inArray(
          selectedOptions.variantId,
          variantRecords.map((variant) => variant.id),
        ),
      )
      .orderBy(selectedOptions.variantId, productOptions.id)

    const selectionsByVariant = new Map<number, ProductOptionSelection[]>()
    for (const record of records) {
      const selections = selectionsByVariant.get(record.variantId) ?? []
      selections.push({
        option: new ProductOption(record.optionId, [], record.optionLabel),
        value: new ProductOptionValue(record.valueId, record.valueLabel),
      })
      selectionsByVariant.set(record.variantId, selections)
    }

    return variantRecords.map(
      (variant) =>
        new Variant(
          variant.id,
          variant.productId,
          variant.unitAmount,
          variant.currency,
          selectionsByVariant.get(variant.id) ?? [],
          variant.thumbnailReference,
        ),
    )
  }

  async createVariant(productId: number, unitAmount: number, currency: string): Promise<Variant> {
    const [record] = await getDrizzleDB()
      .insert(variants)
      .values({ productId, unitAmount, currency })
      .returning({ id: variants.id })

    return new Variant(record.id, productId, unitAmount, currency, [], null)
  }

  async setThumbnail(variant: Variant): Promise<void> {
    await getDrizzleDB()
      .update(variants)
      .set({ thumbnailReference: variant.thumbnail })
      .where(eq(variants.id, variant.id))
  }

  async delete(id: number): Promise<boolean> {
    const [record] = await getDrizzleDB()
      .delete(variants)
      .where(eq(variants.id, id))
      .returning({ id: variants.id })
    return Boolean(record)
  }

  async addSelection(variantId: number, optionId: number, valueId: number): Promise<void> {
    const database = getDrizzleDB()
    const [variant] = await database
      .select({ productId: variants.productId })
      .from(variants)
      .where(eq(variants.id, variantId))
      .limit(1)
    if (!variant) throw new Error("Variant not found")

    await database.insert(selectedOptions).values({
      productId: variant.productId,
      variantId: variantId,
      productOptionId: optionId,
      productOptionValueId: valueId,
    })
  }

  async deleteSelection(variantId: number, optionId: number): Promise<void> {
    await getDrizzleDB()
      .delete(selectedOptions)
      .where(
        and(
          eq(selectedOptions.variantId, variantId),
          eq(selectedOptions.productOptionId, optionId),
        ),
      )
  }
}

export const variantRepository = new VariantRepository()
