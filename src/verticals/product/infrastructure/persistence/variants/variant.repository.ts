import { getDrizzleDB } from "@database"
import { and, eq, inArray } from "drizzle-orm"
import { ProductOption } from "../../../domain/options/product-option.entity"
import { ProductOptionValue } from "../../../domain/options/product-option-value.entity"
import {
  ProductVariant,
  type ProductOptionSelection,
} from "../../../domain/variants/product-variant.entity"
import { productOptionValues, productOptions, productVariants, selectedOptions } from "../schema"

class VariantRepository {
  // TODO: Refactor/cleanup
  async findForProduct(productId: number): Promise<ProductVariant[]> {
    const database = getDrizzleDB()
    const variants = await database
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, productId))
      .orderBy(productVariants.id)

    if (variants.length === 0) return []

    const records = await database
      .select({
        variantId: selectedOptions.productVariantId,
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
          selectedOptions.productVariantId,
          variants.map((variant) => variant.id),
        ),
      )
      .orderBy(selectedOptions.productVariantId, productOptions.id)

    const selectionsByVariant = new Map<number, ProductOptionSelection[]>()
    for (const record of records) {
      const selections = selectionsByVariant.get(record.variantId) ?? []
      selections.push({
        option: new ProductOption(record.optionId, [], record.optionLabel),
        value: new ProductOptionValue(record.valueId, record.valueLabel),
      })
      selectionsByVariant.set(record.variantId, selections)
    }

    return variants.map(
      (variant) =>
        new ProductVariant(
          variant.id,
          variant.productId,
          variant.unitAmount,
          variant.currency,
          selectionsByVariant.get(variant.id) ?? [],
        ),
    )
  }

  async createVariant(
    productId: number,
    unitAmount: number,
    currency: string,
  ): Promise<ProductVariant> {
    const [record] = await getDrizzleDB()
      .insert(productVariants)
      .values({ productId, unitAmount, currency })
      .returning({ id: productVariants.id })

    return new ProductVariant(record.id, productId, unitAmount, currency, [])
  }

  async delete(id: number): Promise<boolean> {
    const [record] = await getDrizzleDB()
      .delete(productVariants)
      .where(eq(productVariants.id, id))
      .returning({ id: productVariants.id })
    return Boolean(record)
  }

  async addSelection(variantId: number, optionId: number, valueId: number): Promise<void> {
    const database = getDrizzleDB()
    const [variant] = await database
      .select({ productId: productVariants.productId })
      .from(productVariants)
      .where(eq(productVariants.id, variantId))
      .limit(1)
    if (!variant) throw new Error("Product variant not found")

    await database.insert(selectedOptions).values({
      productId: variant.productId,
      productVariantId: variantId,
      productOptionId: optionId,
      productOptionValueId: valueId,
    })
  }

  async deleteSelection(variantId: number, optionId: number): Promise<void> {
    await getDrizzleDB()
      .delete(selectedOptions)
      .where(
        and(
          eq(selectedOptions.productVariantId, variantId),
          eq(selectedOptions.productOptionId, optionId),
        ),
      )
  }
}

export const variantRepository = new VariantRepository()
