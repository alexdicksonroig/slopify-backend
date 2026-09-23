import { getDrizzleDB, type DatabaseTransaction } from "@database"
import { and, countDistinct, eq, gte, inArray, or, sql } from "drizzle-orm"
import { ProductOption } from "../../../domain/options/product-option.entity"
import { ProductOptionValue } from "../../../domain/options/product-option-value.entity"
import { Variant, type ProductOptionSelection } from "../../../domain/variants/variant.entity"
import { productOptionValues, productOptions, variants, selectedOptions } from "../schema"

class VariantRepository {
  async findAll(filters: { optionId: string; valueId: number }[]): Promise<Variant[]> {
    const database = getDrizzleDB()
    const filterConditions = filters.map((filter) =>
      and(
        eq(productOptions.optionId, filter.optionId),
        eq(selectedOptions.productOptionValueId, filter.valueId),
      ),
    )
    const variantIds = filterConditions.length
      ? database
          .select({ variantId: selectedOptions.variantId })
          .from(selectedOptions)
          .innerJoin(productOptions, eq(productOptions.id, selectedOptions.productOptionId))
          .where(or(...filterConditions))
          .groupBy(selectedOptions.variantId)
          .having(eq(countDistinct(selectedOptions.productOptionId), filters.length))
      : undefined

    const records = await database
      .select()
      .from(variants)
      .where(variantIds ? inArray(variants.id, variantIds) : undefined)
      .orderBy(variants.id)

    return records.map(
      (record) =>
        new Variant(
          record.id,
          record.productId,
          record.unitAmount,
          record.currency,
          record.stock,
          [],
          record.thumbnailReference,
          record.coverReference,
        ),
    )
  }

  async findById(id: number): Promise<Variant | null> {
    const database = getDrizzleDB()
    const [variant] = await database.select().from(variants).where(eq(variants.id, id)).limit(1)

    if (!variant) return null

    const records = await database
      .select({
        id: productOptions.id,
        optionId: productOptions.optionId,
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

    return new Variant(
      variant.id,
      variant.productId,
      variant.unitAmount,
      variant.currency,
      variant.stock,
      records.map((record) => ({
        option: new ProductOption(record.id, record.optionId, [], record.optionLabel),
        value: new ProductOptionValue(record.valueId, record.valueLabel),
      })),
      variant.thumbnailReference,
      variant.coverReference,
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
        id: productOptions.id,
        optionId: productOptions.optionId,
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
        option: new ProductOption(record.id, record.optionId, [], record.optionLabel),
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
          variant.stock,
          selectionsByVariant.get(variant.id) ?? [],
          variant.thumbnailReference,
          variant.coverReference,
        ),
    )
  }

  async createVariant(
    productId: number,
    unitAmount: number,
    currency: string,
    stock: number,
  ): Promise<Variant> {
    const [record] = await getDrizzleDB()
      .insert(variants)
      .values({ productId, unitAmount, currency, stock })
      .returning({ id: variants.id })

    return new Variant(record.id, productId, unitAmount, currency, stock, [], null, null)
  }

  async setStock(variant: Variant): Promise<void> {
    await getDrizzleDB()
      .update(variants)
      .set({ stock: variant.stock })
      .where(eq(variants.id, variant.id))
  }

  async decrementStock(
    variantId: number,
    quantity: number,
    transaction: DatabaseTransaction,
  ): Promise<void> {
    const [updated] = await transaction
      .update(variants)
      .set({ stock: sql`${variants.stock} - ${quantity}` })
      .where(and(eq(variants.id, variantId), gte(variants.stock, quantity)))
      .returning({ id: variants.id })
    if (!updated) throw new Error(`Variant ${variantId} does not have enough stock`)
  }

  async setThumbnail(variant: Variant): Promise<void> {
    await getDrizzleDB()
      .update(variants)
      .set({ thumbnailReference: variant.thumbnail })
      .where(eq(variants.id, variant.id))
  }

  async setCover(variant: Variant): Promise<void> {
    await getDrizzleDB()
      .update(variants)
      .set({ coverReference: variant.cover })
      .where(eq(variants.id, variant.id))
  }

  async delete(id: number): Promise<boolean> {
    const [record] = await getDrizzleDB()
      .delete(variants)
      .where(eq(variants.id, id))
      .returning({ id: variants.id })
    return Boolean(record)
  }

  async addSelection(variantId: number, optionId: string, valueId: number): Promise<void> {
    const database = getDrizzleDB()
    const [variant] = await database
      .select({ productId: variants.productId })
      .from(variants)
      .where(eq(variants.id, variantId))
      .limit(1)
    if (!variant) throw new Error("Variant not found")

    const [option] = await database
      .select({ id: productOptions.id })
      .from(productOptions)
      .where(eq(productOptions.optionId, optionId))
      .limit(1)
    if (!option) throw new Error("Product option not found")

    await database.insert(selectedOptions).values({
      productId: variant.productId,
      variantId: variantId,
      productOptionId: option.id,
      productOptionValueId: valueId,
    })
  }

  async deleteSelection(variantId: number, optionId: string): Promise<void> {
    await getDrizzleDB()
      .delete(selectedOptions)
      .where(
        and(
          eq(selectedOptions.variantId, variantId),
          inArray(
            selectedOptions.productOptionId,
            getDrizzleDB()
              .select({ id: productOptions.id })
              .from(productOptions)
              .where(eq(productOptions.optionId, optionId)),
          ),
        ),
      )
  }
}

export const variantRepository = new VariantRepository()
